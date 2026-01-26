#!/bin/bash
set -a
[ -f .env ] && source .env
set +a

API_KEY is $API_KEY
ENDPOINT_URL is $ENDPOINT_URL

curl -i -X POST "$ENDPOINT_URL/contentunderstanding/analyzers/prebuilt-invoice:analyze?api-version=2025-11-01" \
  -H "Ocp-Apim-Subscription-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "inputs":[{"url": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-fundamentals/refs/heads/main/data/contoso-invoice-1.pdf"}]
      }'