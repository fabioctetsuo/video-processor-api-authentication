# Auth Service Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Authentication Service.

## Architecture

- **Auth Service**: Main authentication API (2+ replicas with HPA)
- **PostgreSQL**: Database for user authentication data
- **Redis**: Caching layer for JWT tokens and sessions

## Prerequisites

1. Kubernetes cluster (1.21+)
2. kubectl configured
3. Docker image built and pushed to `fabioctetsuo/video-processor-api-authentication`

## Quick Deploy

```bash
# Apply all resources
kubectl apply -k .

# Or apply individually
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f redis-service.yaml
kubectl apply -f auth-service-deployment.yaml
kubectl apply -f auth-service-service.yaml
kubectl apply -f auth-service-hpa.yaml
```

## Verification

```bash
# Check all pods are running
kubectl get pods -n video-processor-auth

# Check services
kubectl get svc -n video-processor-auth

# Check HPA status
kubectl get hpa -n video-processor-auth

# View logs
kubectl logs -n video-processor-auth deployment/auth-service -f
```

## Configuration

### Secrets
Update `secret.yaml` with base64 encoded values:
- `JWT_SECRET`: Your JWT signing secret
- `POSTGRES_PASSWORD`: Database password

### ConfigMap
Modify `configmap.yaml` for environment-specific settings:
- Database connection strings
- JWT token expiration times
- Redis connection settings

## Scaling

The service includes Horizontal Pod Autoscaler (HPA):
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

## Monitoring

Access the service:
```bash
# Get external IP
kubectl get svc auth-service -n video-processor-auth

# Port forward for local testing
kubectl port-forward svc/auth-service 3002:3002 -n video-processor-auth
```

## Database Migrations

The service will automatically run Prisma migrations on startup. Ensure the PostgreSQL pod is ready before the auth-service starts.

## Cleanup

```bash
# Delete all resources
kubectl delete -k .
```