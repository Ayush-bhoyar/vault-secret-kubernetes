# Using Hashicorp vault for managing our secrets in Kubernetes

## Prerequisites

1. Install kubectl: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
2. Install helm: https://helm.sh/docs/intro/install/

## Install eksctl
```
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

## Create a cluster
```
eksctl create cluster --name my-cluster --region ap-south-1 --node-type t2.medium --version 1.35
```

## Install hashicorp vault on the cluster

```
helm repo add hashicorp https://helm.releases.hashicorp.com/
helm repo update
helm install vault hashicorp/vault --set "server.dev.enabled=true"
```

Make the type of service as LoadBalancer
```
kubectl edit svc/vault
```

```
helm repo add external-secrets https://charts.external-secrets.io
helm repo update
helm install external-secrets external-secrets/external-secrets --namespace external-secrets --create-namespace --set installCRDs=true
```

## Install EBS CSI driver 

```
aws iam attach-role-policy \
  --role-name <NodeInstanceRoleName> \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy
```

```
kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.44"
```

## Steps to be followed

1. Create a secret for vault-token
```
kubectl create secret generic vault-token \
  --namespace default \
  --from-literal=token=root
```

2. Add secrets to the vault

3. Build a docker image and push to the docker hub
```
docker build -t <your-docker-account-name>/vault-db-app:latest app/
docker push <your-docker-account-name>/vault-db-app:latest
```

5. Apply sequence
```
cd k8s/
kubectl apply -f namespace.yaml
kubectl apply -f cluster-secret.yaml
kubectl apply -f external-secret.yaml
kubectl apply -f external-secret-docker.yaml
kubectl apply -f postgres.yaml
kubectl apply -f app.yaml
```
