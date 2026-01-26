#!/bin/bash
set -a
[ -f .env ] && source .env
set +a

API_KEY is $API_KEY
ENDPOINT_URL is $ENDPOINT_URL

# Below, replace {myGPT41Deployment} with the name of your GPT-4.1 deployment (eg. "gpt-4-1")
# Below, replace {myGPT41MiniDeployment} with the name of your GPT-4.1 Mini deployment (eg. "gpt-4-1-mini")
# Below, replace {myEmbeddingDeployment} with the name of your Embedding deployment (eg. "text-embedding-3-large")


curl -i -X PATCH "$ENDPOINT_URL/contentunderstanding/defaults?api-version=2025-11-01" \
  -H "Ocp-Apim-Subscription-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "modelDeployments": {
          "gpt-4.1": "{myGPT41Deployment}",
          "gpt-4.1-mini": "{myGPT41MiniDeployment}",
          "text-embedding-3-large": "{myEmbeddingDeployment}"
        }
      }'