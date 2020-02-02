# Multi K8s
[![Build Status](https://travis-ci.org/discorev/multi-k8s.svg?branch=master)](https://travis-ci.org/discorev/multi-k8s)
![GitHub](https://img.shields.io/github/license/discorev/multi-k8s)

This project is a designed to explore kubernetes deployments using a highly overly complicated architecture to allow for creating many pods and using multiple different technologies.

A high level overview of the architecture is down in the image below.
![Architecture](/images/architecture.png)

### What it does
Once deployed the multi-k8s website allows users to enter a number and calculates the Fibonacci number at that index.

The user-facing deployment consits of the following:

* The [multi-client](/client) &mdash; a simple ReactJS site with the form to enter a new index and shows the results of the calculations.
* The [multi-server](/server) &mdash; an express server that acts as the REST API, reading and writing to the postgres database and redis instance.
* The [multi-worker](/worker) &mdash; a nodejs worker that subscribes to inserts into the redis instance and calcualtes the Fibonacci number for the given index, saving the result back into redis.

Also created:

* A postgres database with a persistant volume claim
* A redis instance
* NGINX ingress routing requests to the `multi-client` or `multi-server` depending on the path component of the request.

### Google Cloud deployment
This project is automatically deployed to Google Cloud using [Travis CI](https://travis-ci.org)

On Google Cloud the deployment makes use of a Google Cloud Load balancer
![Google Cloud Deployment](/images/gcloud-deployment.png)