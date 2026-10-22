# WorkSe_backend

## CORS configuration

The API allows the local Vite origins `http://localhost:5173` and
`http://localhost:5174` by default and supports credentialed requests for
cookie-based authentication. For other frontend origins, set `CORS_ORIGINS` in
the backend environment to a comma-separated list of exact origins, for example:

```env
CORS_ORIGINS=https://kaamsathi.example.com,https://www.kaamsathi.example.com
```

Restart the backend after changing this setting. Do not use `*` for origins when
credentials are enabled.
