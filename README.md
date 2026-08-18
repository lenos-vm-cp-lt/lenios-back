## Seguridad en Producción

Verificaciones realizadas directamente contra la URL pública de producción (`https://lenios-back.onrender.com`), confirmando que los mecanismos de seguridad funcionan en el entorno real y no solo en local.

### 1. RBAC + JWT
Las rutas administrativas rechazan peticiones sin un JWT válido.

**Prueba:** `GET /api/v1/admin/dashboard` sin token de autenticación.
**Resultado:** `401 No autorizado`

<img width="948" height="161" alt="image" src="https://github.com/user-attachments/assets/a4dcf0c6-38b8-4546-bb74-cc771f58e984" />


### 2. HTTPS Forzado
Render redirige automáticamente todo tráfico HTTP hacia HTTPS.

**Prueba:** `GET http://lenios-back.onrender.com/health`
**Resultado:** `301 Moved Permanently` → `https://lenios-back.onrender.com/health`

<img width="934" height="453" alt="image" src="https://github.com/user-attachments/assets/7deab81a-b1c9-4ca3-8b92-4e6b192b91c6" />


### 3. Sanitización de Inputs en Producción
El middleware `express-mongo-sanitize` neutraliza intentos de NoSQL injection también en el entorno desplegado.

**Prueba:** `POST /api/v1/auth/login` con payload `{"email": {"$ne": null}, "password": {"$ne": null}}`
**Resultado:** `400 Solicitud incorrecta` — el intento de bypass de autenticación fue rechazado.

<img width="939" height="187" alt="image" src="https://github.com/user-attachments/assets/87aaaaed-39c3-468e-8985-692483732909" />
