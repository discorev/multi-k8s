# Creating a secret

Creating a secret is something we will do in an imperative way for security as we do not want the plaintext in a file

kubeclt create secret generic <secret_name> --from-literal key=value

for this project
`kubectl create secret generic pgpassword --from-literal PGPASSWORD=<secret>`

kubectl get secrets

# Ingress
we're using ingress nginx for ingress routing

github.com/kubernetes/ingress-nginx