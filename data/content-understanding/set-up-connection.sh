#!/bin/bash
set -a
[ -f .env ] && source .env
set +a

API_KEY is $API_KEY
ENDPOINT_URL is $ENDPOINT_URL

curl -i -X PATCH "$ENDPOINT_URL/contentunderstanding/defaults?api-version=2025-11-01" \
  -H "Ocp-Apim-Subscription-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "modelDeployments": {
          "gpt-4.1": "gpt-4.1",
          "gpt-4.1-mini": "gpt-4.1-mini",
          "text-embedding-3-large": "text-embedding-3-large"
        }
      }'