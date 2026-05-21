module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:4321/dpg-dpi-govstack-map/",
        "http://127.0.0.1:4321/dpg-dpi-govstack-map/projects/",
        "http://127.0.0.1:4321/dpg-dpi-govstack-map/organizations/",
        "http://127.0.0.1:4321/dpg-dpi-govstack-map/compare/",
        "http://127.0.0.1:4321/dpg-dpi-govstack-map/map/",
        "http://127.0.0.1:4321/dpg-dpi-govstack-map/accessibility/"
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless=new --no-sandbox",
        preset: "desktop"
      }
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }]
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
};
