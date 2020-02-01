#!/usr/bin/env sh
docker build -t discorev/multi-client:latest -t discorev/multi-client:$SHA ./client
docker build -t disocrev/multi-server:latest -t discorev/multi-server:$SHA ./server
docker build -t discorev/multi-worker:latest -t discorev/multi-worker:$SHA ./worker

# Push the tags built above
docker push discorev/multi-client:latest
docker push discorev/multi-client:$SHA
docker push discorev/multi-server:latest
docker push discorev/multi-server:$SHA
docker push discorev/multi-worker:latest
docker push discorev/multi-worker:$SHA

# Apply the kubernetes configs from the repo
kubectl apply -f k8s

# Imperatively set the image to the build we've just done - this will cause an update
# on an existing kube deployment
kubectl set image deployments/client-deployment client=discorev/multi-client:$SHA
kubectl set image deployments/server-deployment server=discorev/multi-server:$SHA
kubectl set image deployments/worker-deployment worker=discorev/multi-worker:$SHA