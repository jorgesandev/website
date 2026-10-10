import { expect, test, type Locator, type Page } from "@playwright/test";

test.beforeEach(({ page }) => {
  const size = page.viewportSize();
  test.skip(!size || size.width < size.height || size.height > 600);
});

async function setup(page: Page, mode = "assisted") {
  await page.goto("/pingpong");
  await page
    .getByRole("button", { name: "Nuevo partido", exact: false })
    .click();
  await page
    .getByPlaceholder("Jugador 1", { exact: true })
    .fill("Alejandro Sandoval");
  await page
    .getByPlaceholder("Jugador 2", { exact: true })
    .fill("Amigo de Alejandro");
  await page.locator(`input[name=mode][value=${mode}]`).check();
  await page.getByRole("button", { name: "Empezar partido" }).click();
}

async function inViewport(locator: Locator, page: Page) {
  const bounds = await locator.boundingBox();
  const size = page.viewportSize()!;
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width + 1);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height + 1);
}

async function fakeCamera(page: Page) {
  await page.addInitScript(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext("2d")!;
    let x = 0;
    setInterval(() => {
      context.fillStyle = "#14202a";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.beginPath();
      context.arc(140 + (x++ % 100) * 3, 230, 4, 0, Math.PI * 2);
      context.fill();
    }, 33);
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: () => Promise.resolve(canvas.captureStream(30)) },
      configurable: true,
    });
    (window as typeof window & { rotateVideo: () => void }).rotateVideo =
      () => {
        canvas.width = 360;
        canvas.height = 640;
      };
  });
}

async function calibrate(page: Page) {
  const overlay = page.getByRole("img", {
    name: "Vista de calibración de la mesa",
  });
  await inViewport(overlay, page);
  const bounds = (await overlay.boundingBox())!;
  for (const [x, y] of [
    [0.1, 0.85],
    [0.9, 0.85],
    [0.9, 0.15],
    [0.1, 0.15],
  ]) {
    await overlay.click({
      position: { x: x * bounds.width, y: y * bounds.height },
    });
  }
  await expect(
    page.getByText("Mesa calibrada.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Reanudar" })).toBeEnabled();
}

test("landscape keeps camera, scores and pause visible without page scrolling", async ({
  page,
}) => {
  await fakeCamera(page);
  await setup(page);
  await expect(
    page.getByRole("button", { name: "Activar cámara", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  for (const selector of ["score-0", "score-1"])
    await inViewport(page.getByTestId(selector), page);
  await inViewport(page.getByRole("button", { name: "Reanudar" }), page);
  await inViewport(
    page.getByRole("button", {
      name: "Punto para Alejandro Sandoval",
      exact: true,
    }),
    page,
  );
  const score = (await page
    .getByRole("region", { name: "Marcador", exact: true })
    .boundingBox())!;
  const camera = (await page
    .getByRole("region", { name: "Cámara y seguimiento" })
    .boundingBox())!;
  expect(camera.x).toBeGreaterThan(score.x + score.width);
  await page
    .getByRole("button", { name: "Activar cámara", exact: true })
    .click();
  await calibrate(page);
  await page.getByRole("button", { name: "Reanudar" }).click();
  await inViewport(
    page.getByRole("button", { name: "Pausa", exact: false }),
    page,
  );
  await page
    .getByRole("button", { name: "Punto para Alejandro Sandoval", exact: true })
    .click();
  await expect(page.getByTestId("score-0")).toHaveText("01");
  await page.getByRole("button", { name: "Pausa", exact: false }).click();
  await page.getByRole("button", { name: "Ajustar detección" }).click();
  await page
    .getByRole("combobox", { name: "Pelota", exact: true })
    .selectOption("orange");
  await expect(
    page.getByRole("combobox", { name: "Pelota", exact: true }),
  ).toHaveValue("orange");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("orientation events and resized camera frames invalidate calibration and can recover", async ({
  page,
}) => {
  await fakeCamera(page);
  await setup(page);
  await page
    .getByRole("button", { name: "Activar cámara", exact: true })
    .click();
  await calibrate(page);
  await page.getByRole("button", { name: "Reanudar" }).click();
  await page
    .getByRole("button", { name: "Punto para Alejandro Sandoval", exact: true })
    .click();
  const landscape = page.viewportSize()!;
  for (const modern of [false, true]) {
    if (!modern)
      await page.setViewportSize({
        width: landscape.height,
        height: landscape.width,
      });
    await page.evaluate((modern) => {
      if (modern) screen.orientation.dispatchEvent(new Event("change"));
      else window.dispatchEvent(new Event("orientationchange"));
    }, modern);
    await expect(page.getByRole("button", { name: "Reanudar" })).toBeDisabled();
    await expect(page.locator("#calibration-help")).toContainText(
      "cercana izquierda",
    );
    await expect(page.getByTestId("score-0")).toHaveText("01");
    if (!modern) {
      await page.setViewportSize(landscape);
      await page.evaluate(() =>
        window.dispatchEvent(new Event("orientationchange")),
      );
    }
    await calibrate(page);
    await page.getByRole("button", { name: "Reanudar" }).click();
  }
  await page.evaluate(() =>
    (window as typeof window & { rotateVideo: () => void }).rotateVideo(),
  );
  await expect(page.locator("video")).toHaveJSProperty("videoWidth", 360);
  await expect(page.getByRole("button", { name: "Reanudar" })).toBeDisabled();
  await calibrate(page);
  await page.getByRole("button", { name: "Reanudar" }).click();
  await expect(
    page.getByRole("button", { name: "Pausa", exact: false }),
  ).toBeEnabled();
});

test("short-screen dialogs keep their actions reachable and manual play survives rotation", async ({
  page,
}) => {
  await setup(page, "manual");
  await inViewport(
    page.getByRole("button", {
      name: "Punto para Alejandro Sandoval",
      exact: true,
    }),
    page,
  );
  await page.evaluate(() =>
    window.dispatchEvent(new Event("orientationchange")),
  );
  await page
    .getByRole("button", { name: "Punto para Alejandro Sandoval", exact: true })
    .click();
  await expect(page.getByTestId("score-0")).toHaveText("01");
  await page
    .getByRole("button", { name: "Terminar partido", exact: true })
    .click();
  await inViewport(page.getByRole("dialog"), page);
  await page.getByRole("button", { name: "Volver al partido" }).click();
  await page.getByRole("button", { name: "Cómo funciona" }).click();
  await inViewport(page.getByRole("dialog"), page);
  await page.getByRole("button", { name: "Entendido" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
