import { expect, test, type Page } from "@playwright/test";
async function setup(page: Page, mode = "manual", bestOf = "1") {
  await page.goto("/pingpong");
  await page
    .getByRole("button", { name: "Nuevo partido", exact: false })
    .click();
  await page.getByPlaceholder("Jugador 1", { exact: true }).fill("Alejandro");
  await page.getByPlaceholder("Jugador 2", { exact: true }).fill("Amigo");
  await page.getByLabel("Partido al mejor de").selectOption(bestOf);
  await page.locator(`input[name=mode][value=${mode}]`).check();
  await page.getByRole("button", { name: "Empezar partido" }).click();
}
test("manual match: service, undo, correction, reload and result", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await setup(page);
  const a = page.getByRole("button", {
    name: "Punto para Alejandro",
    exact: true,
  });
  await a.click();
  await a.click();
  await expect(page.getByTestId("score-0")).toHaveText("02");
  await expect(
    page.getByRole("status").filter({ hasText: "Saca Amigo" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Corregir último" }).click();
  await expect(page.getByTestId("score-0")).toHaveText("01");
  await expect(page.getByTestId("score-1")).toHaveText("01");
  await page.getByRole("button", { name: "Reanudar" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByTestId("score-1")).toHaveText("00");
  await page.getByRole("button", { name: "Guardar y volver" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Continuar partido" }).click();
  await expect(page.getByTestId("score-0")).toHaveText("01");
  await page.getByRole("button", { name: "Reanudar" }).click();
  for (let i = 0; i < 4; i++) await a.click();
  await page.getByRole("button", { name: "Listo, seguir" }).click();
  for (let i = 0; i < 6; i++) await a.click();
  await expect(page.getByText("Ganó Alejandro", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Revancha" }).click();
  await expect(page.getByTestId("score-0")).toHaveText("00");
  expect(errors).toEqual([]);
});
test("denied camera has clear fallback and manual match works", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: () =>
          Promise.reject(new DOMException("denied", "NotAllowedError")),
      },
      configurable: true,
    });
  });
  await setup(page, "assisted");
  await page
    .getByRole("button", { name: "Activar cámara", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Permite el acceso",
  );
  await page.getByRole("button", { name: "Usar modo manual" }).click();
  await page.getByRole("button", { name: "Punto para Alejandro" }).click();
  await expect(page.getByTestId("score-0")).toHaveText("01");
});
test("synthetic camera calibrates and the worker follows pixels without automatic points", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext("2d")!;
    let x = 0;
    setInterval(() => {
      context.fillStyle = "#102732";
      context.fillRect(0, 0, 640, 360);
      context.fillStyle = "white";
      context.beginPath();
      context.arc(140 + (x++ % 100) * 3, 230, 4, 0, Math.PI * 2);
      context.fill();
    }, 33);
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: () => Promise.resolve(canvas.captureStream(30)) },
      configurable: true,
    });
  });
  await setup(page, "assisted");
  await page
    .getByRole("button", { name: "Activar cámara", exact: true })
    .click();
  const overlay = page.getByRole("img", {
    name: "Vista de calibración de la mesa",
  });
  await expect(overlay).toBeVisible();
  const bounds = await overlay.boundingBox();
  if (!bounds) throw new Error("No camera bounds");
  for (const [x, y] of [
    [0.1, 0.85],
    [0.9, 0.85],
    [0.9, 0.15],
    [0.1, 0.15],
  ])
    await overlay.click({
      position: { x: x * bounds.width, y: y * bounds.height },
    });
  await expect(
    page.getByText("Mesa calibrada.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reanudar" }).click();
  await expect(
    page.getByText("Pelota en juego", { exact: false }),
  ).toBeVisible();
  await expect(page.getByTestId("score-0")).toHaveText("00");
  await expect(page.getByTestId("score-1")).toHaveText("00");
  await page.getByRole("button", { name: "Pausa", exact: false }).click();
  await expect(page.getByText("En pausa", { exact: true })).toBeVisible();
});
test("help is keyboard accessible and layout fits viewport", async ({
  page,
}) => {
  await page.goto("/pingpong");
  await page.getByRole("button", { name: "Cómo funciona" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".site-header")).toHaveCount(0);
});
test("portfolio and privacy still render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.locator("h1")).toBeVisible();
  await page.goto("/privacy");
  await expect(page.locator("h1")).toBeVisible();
});

for (const mode of ["automatic", "assisted"]) {
  test(`${mode} mode handles a synthetic double-bounce proposal and correction`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const context = canvas.getContext("2d")!;
      const ys: number[] = [];
      for (let i = 0; i < 15; i++) ys.push(65 - i * 3);
      for (let i = 0; i < 15; i++) ys.push(23 + i * 3);
      ys.push(67, 70, 73, 76, 73, 70, 67, 64, 62, 65, 68, 71, 74, 71, 68);
      let index = -1;
      (window as typeof window & { startRally: () => void }).startRally =
        () => {
          index = 0;
        };
      setInterval(() => {
        context.fillStyle = "#14202a";
        context.fillRect(0, 0, 640, 360);
        context.fillStyle = "white";
        const x = index < 0 ? 60 : 60 + Math.min(index, ys.length - 1);
        const y = index < 0 ? 65 : ys[Math.min(index, ys.length - 1)];
        context.fillRect((x - 1) * 4, (y - 1) * 4, 12, 12);
        if (index >= 0 && index < ys.length - 1) index++;
      }, 33);
      Object.defineProperty(navigator, "mediaDevices", {
        value: {
          getUserMedia: () => Promise.resolve(canvas.captureStream(30)),
        },
        configurable: true,
      });
    });
    await setup(page, mode, "3");
    await page
      .getByRole("button", { name: "Activar cámara", exact: true })
      .click();
    const overlay = page.getByRole("img", {
      name: "Vista de calibración de la mesa",
    });
    await expect(overlay).toBeVisible();
    const bounds = await overlay.boundingBox();
    if (!bounds) throw new Error("Missing camera");
    for (const [x, y] of [
      [0.1, 0.85],
      [0.9, 0.85],
      [0.9, 0.15],
      [0.1, 0.15],
    ])
      await overlay.click({
        position: { x: x * bounds.width, y: y * bounds.height },
      });
    await page.getByRole("button", { name: "Reanudar" }).click();
    await page.evaluate(() =>
      (window as typeof window & { startRally: () => void }).startRally(),
    );
    if (mode === "assisted") {
      const dialog = page.getByRole("dialog", { name: "Confirma el punto" });
      await expect(dialog).toBeVisible({ timeout: 10000 });
      const bounds = (await dialog.boundingBox())!;
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(
        page.viewportSize()!.height + 1,
      );
      await dialog.getByRole("button", { name: "Amigo +1" }).click();
    }
    await expect(page.getByTestId("score-1")).toHaveText("01", {
      timeout: 10000,
    });
    await page.getByRole("button", { name: "Corregir último" }).click();
    await expect(page.getByTestId("score-0")).toHaveText("01");
    await expect(page.getByTestId("score-1")).toHaveText("00");
  });
}

test("undoing a deciding-set side change asks players to restore their positions", async ({
  page,
}) => {
  await setup(page, "manual", "1");
  const a = page.getByRole("button", {
    name: "Punto para Alejandro",
    exact: true,
  });
  for (let i = 0; i < 5; i++) await a.click();
  await expect(page.getByRole("dialog")).toContainText("Amigo");
  await page.getByRole("button", { name: "Listo, seguir" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByRole("dialog")).toContainText("Alejandro");
  await page.getByRole("button", { name: "Listo, seguir" }).click();
  await expect(page.getByTestId("score-0")).toHaveText("04");
});
