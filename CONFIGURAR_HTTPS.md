# 🔒 Como Configurar HTTPS Local

## ✅ Método 1: mkcert (Recomendado - Funciona Offline)

### Passo 1: Instalar Chocolatey (Gerenciador de Pacotes)
Abra PowerShell como **Administrador** e execute:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Passo 2: Instalar mkcert
```powershell
choco install mkcert
```

### Passo 3: Instalar Autoridade Certificadora Local
```powershell
mkcert -install
```

### Passo 4: Gerar Certificado para Localhost
```powershell
cd "D:\ferramenta oculos"
mkcert localhost 127.0.0.1 ::1 192.168.3.74
```

Isso criará dois arquivos:
- `localhost+3.pem` (certificado)
- `localhost+3-key.pem` (chave privada)

### Passo 5: Usar Servidor HTTPS com Python

Crie um arquivo `server_https.py` na pasta do projeto:

```python
import http.server
import ssl
import socketserver

PORT = 8443

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('localhost+3.pem', 'localhost+3-key.pem')
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"Servidor HTTPS rodando em https://192.168.3.74:{PORT}")
    print(f"Acesse no celular: https://192.168.3.74:{PORT}")
    httpd.serve_forever()
```

### Passo 6: Executar Servidor HTTPS
```powershell
python server_https.py
```

### Passo 7: Acessar no Celular
```
https://192.168.3.74:8443
```

**Nota:** Pode aparecer um aviso de segurança - clique em "Avançado" e "Continuar mesmo assim"

---

## ✅ Método 2: ngrok (Mais Fácil - Requer Internet)

### Passo 1: Baixar ngrok
1. Acesse: https://ngrok.com/download
2. Baixe para Windows
3. Extraia `ngrok.exe` em `C:\ngrok\`

### Passo 2: Criar Conta Gratuita
1. Acesse: https://dashboard.ngrok.com/signup
2. Crie conta e copie seu **authtoken**

### Passo 3: Configurar ngrok
```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken SEU_TOKEN_AQUI
```

### Passo 4: Iniciar Túnel
Com o servidor Python rodando na porta 3000:
```powershell
.\ngrok.exe http 3000
```

### Passo 5: Usar URL HTTPS
O ngrok mostrará uma URL como:
```
https://abc123.ngrok-free.app
```

Use essa URL no celular - funciona perfeitamente!

---

## ✅ Método 3: Servidor HTTPS Simples (Python com SSL)

Se já tiver os certificados, use este script:

```python
import http.server
import ssl
import socketserver

PORT = 8443

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('cert.pem', 'key.pem')
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"Servidor HTTPS: https://192.168.3.74:{PORT}")
    httpd.serve_forever()
```

---

## 🚀 Solução Mais Rápida (ngrok sem instalar)

Se tiver Node.js:
```powershell
npx --yes ngrok http 3000
```

---

## 📝 Comparação dos Métodos

| Método | Dificuldade | Requer Internet | URL Fixa |
|--------|-------------|-----------------|----------|
| **mkcert** | Média | ❌ Não | ✅ Sim |
| **ngrok** | Fácil | ✅ Sim | ❌ Não (gratuito) |
| **npx ngrok** | Muito Fácil | ✅ Sim | ❌ Não |

---

## ⚠️ Importante

- **mkcert**: Funciona offline, mas precisa instalar certificado no celular
- **ngrok**: Mais fácil, mas requer internet e URL muda a cada execução
- **Avisos de segurança**: São normais em desenvolvimento local - pode ignorar

---

## 🎯 Recomendação

Para desenvolvimento rápido: **Use ngrok** (Método 2)
Para produção local: **Use mkcert** (Método 1)

