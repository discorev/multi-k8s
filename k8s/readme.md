# Creating a secret

Creating a secret is something we will do in an imperative way for security as we do not want the plaintext in a file

kubeclt create secret generic <secret_name> --from-literal key=value

for this project
`kubectl create secret generic pgpassword --from-literal PGPASSWORD=<secret>`

kubectl get secrets

# Ingress
we're using ingress nginx for ingress routing

github.com/kubernetes/ingress-nginx

# Helm
install helm v3
    curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 > get_helm.sh
    chmod 700 get_helm.sh
    ./get_helm.sh

# Install Cert Manager

    kubectl apply --validate=false -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.11/deploy/manifests/00-crds.yaml
    kubectl create namespace cert-manager
    helm repo add jetstack https://charts.jetstack.io
    helm repo update

Then install the helm chart:

    helm install \
      cert-manager \
      --namespace cert-manager \
      --version v0.11.0 \
      jetstack/cert-manager
