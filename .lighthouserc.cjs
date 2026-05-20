module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:4321/",
        "http://127.0.0.1:4321/projects/",
        "http://127.0.0.1:4321/organizations/",
        "http://127.0.0.1:4321/compare/",
        "http://127.0.0.1:4321/map/",
        "http://127.0.0.1:4321/accessibility/"
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
