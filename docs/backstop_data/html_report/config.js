report({
  "testSuite": "BackstopJS",
  "tests": [
    {
      "pair": {
        "reference": "../../../backstop_data/bitmaps_reference/backstop_default_qq_0_document_0_phone.png",
        "test": "../../../backstop_data/bitmaps_test/20250810-114936/backstop_default_qq_0_document_0_phone.png",
        "selector": "document",
        "fileName": "backstop_default_qq_0_document_0_phone.png",
        "label": "qq",
        "requireSameDimensions": true,
        "misMatchThreshold": 0.1,
        "url": "https://map.qq.com/m/",
        "referenceUrl": "",
        "expect": 0,
        "viewportLabel": "phone",
        "diff": {
          "isSameDimensions": true,
          "dimensionDifference": {
            "width": 0,
            "height": 0
          },
          "rawMisMatchPercentage": 1.163040223575207,
          "misMatchPercentage": "1.16",
          "analysisTime": 13
        },
        "diffImage": "../../../backstop_data/bitmaps_test/20250810-114936/failed_diff_backstop_default_qq_0_document_0_phone.png"
      },
      "status": "fail"
    },
    {
      "pair": {
        "reference": "../../../backstop_data/bitmaps_reference/backstop_default_qq_0_document_1_tablet.png",
        "test": "../../../backstop_data/bitmaps_test/20250810-114936/backstop_default_qq_0_document_1_tablet.png",
        "selector": "document",
        "fileName": "backstop_default_qq_0_document_1_tablet.png",
        "label": "qq",
        "requireSameDimensions": true,
        "misMatchThreshold": 0.1,
        "url": "https://map.qq.com/m/",
        "referenceUrl": "",
        "expect": 0,
        "viewportLabel": "tablet",
        "error": "Reference file not found /Users/yuanzhijia/Desktop/yd-ai-spa/backstop_data/bitmaps_reference/backstop_default_qq_0_document_1_tablet.png"
      },
      "status": "fail"
    }
  ],
  "id": "backstop_default"
});