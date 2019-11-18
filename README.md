# Launch Service
## build docker image
```
docker build -t erp-api ./ --rm
```

## run docker image
```
docker run \
--name erp-api \
-d \
--rm \
-p 8080:8080 \
erp-api
```
