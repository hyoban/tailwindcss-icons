import { expect, test } from "vitest"

import { generateComponent, getIconCollections } from "./core"

test("generateComponent", () => {
  const collections = getIconCollections(["mdi"])
  expect(
    generateComponent(
      { icons: collections["mdi"], name: "home" },
      {
        scale: 1.5,
        extraProperties: {
          "-webkit-mask-size": "contain",
          "-webkit-mask-position": "center",
        },
      },
    ),
  ).toMatchInlineSnapshot(`
    {
      "--svg": "url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E")",
      "-webkit-mask-image": "var(--svg)",
      "-webkit-mask-position": "center",
      "-webkit-mask-repeat": "no-repeat",
      "-webkit-mask-size": "contain",
      "background-color": "currentColor",
      "display": "inline-block",
      "height": "1.5em",
      "mask-image": "var(--svg)",
      "mask-repeat": "no-repeat",
      "mask-size": "100% 100%",
      "width": "1.5em",
    }
  `)
})

test("generate component with custom stroke width", () => {
  const collections = getIconCollections(["lucide", "mdi", "gala"])

  expect(
    generateComponent(
      { icons: collections["mdi"], name: "home" },
      { strokeWidth: 1 },
    ),
  ).toMatchInlineSnapshot(`
    {
      "--svg": "url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cg stroke-width='1'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/g%3E%3C/svg%3E")",
      "-webkit-mask-image": "var(--svg)",
      "-webkit-mask-repeat": "no-repeat",
      "-webkit-mask-size": "100% 100%",
      "background-color": "currentColor",
      "display": "inline-block",
      "height": "undefinedem",
      "mask-image": "var(--svg)",
      "mask-repeat": "no-repeat",
      "mask-size": "100% 100%",
      "width": "undefinedem",
    }
  `)

  expect(
    generateComponent(
      { icons: collections["lucide"], name: "home" },
      { strokeWidth: 1 },
    ),
  ).toMatchInlineSnapshot(`
    {
      "--svg": "url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'%3E%3Cpath d='M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'/%3E%3Cpath d='M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3C/g%3E%3C/svg%3E")",
      "-webkit-mask-image": "var(--svg)",
      "-webkit-mask-repeat": "no-repeat",
      "-webkit-mask-size": "100% 100%",
      "background-color": "currentColor",
      "display": "inline-block",
      "height": "undefinedem",
      "mask-image": "var(--svg)",
      "mask-repeat": "no-repeat",
      "mask-size": "100% 100%",
      "width": "undefinedem",
    }
  `)
})
