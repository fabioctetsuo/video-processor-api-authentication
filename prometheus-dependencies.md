# Prometheus Dependencies for Auth Service

Add these dependencies to your auth-service package.json:

```bash
# In auth-service directory
npm install prom-client
npm install --save-dev @types/prom-client
```

Or add to package.json:

```json
{
  "dependencies": {
    "prom-client": "^15.1.0"
  },
  "devDependencies": {
    "@types/prom-client": "^15.0.0"
  }
}
```

## Module Integration

Add MetricsModule to your app.module.ts:

```typescript
import { MetricsModule } from './infrastructure/metrics/metrics.module';

@Module({
  imports: [
    // ... other imports
    MetricsModule,
  ],
  // ... rest of module
})
export class AppModule {}
```

## Global Interceptor (Optional)

To automatically track all HTTP requests, add to main.ts:

```typescript
import { MetricsInterceptor } from './infrastructure/interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get PrometheusService from the app context
  const prometheusService = app.get(PrometheusService);
  
  // Apply globally
  app.useGlobalInterceptors(new MetricsInterceptor(prometheusService));
  
  await app.listen(3002);
}
```