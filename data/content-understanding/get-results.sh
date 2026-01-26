#!/bin/bash
set -a
[ -f .env ] && source .env
set +a

API_KEY is $API_KEY
ENDPOINT_URL is $ENDPOINT_URL

# Remember to replace <REQUEST_ID> below with the actual request ID obtained from the POST response

curl -i -X GET "$ENDPOINT_URL/contentunderstanding/analyzerResults/<REQUEST_ID>?api-version=2025-11-01" \
  -H "Ocp-Apim-Subscription-Key: $API_KEY"