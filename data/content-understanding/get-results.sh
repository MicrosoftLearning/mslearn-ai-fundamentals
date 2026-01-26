#!/bin/bash
set -a
[ -f .env ] && source .env

# Below, remember to replace {REQUEST_ID} below with the actual request ID obtained from the POST response

curl -i -X GET "$ENDPOINT_URL/contentunderstanding/analyzerResults/{REQUEST_ID}?api-version=2025-11-01" \
  -H "Ocp-Apim-Subscription-Key: $API_KEY"