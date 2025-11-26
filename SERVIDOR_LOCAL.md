# 📱 Como Abrir no Celular

## Opção 1: Servidor HTTP Local (Recomendado)

### Passo 1: Instalar Python (se não tiver)
- Windows: Baixe em https://www.python.org/downloads/
- Mac: Já vem instalado
- Linux: `sudo apt install python3`

### Passo 2: Abrir terminal na pasta do projeto
- Windows: Clique com botão direito na pasta → "Abrir no Terminal"
- Ou navegue até a pasta: `cd "D:\ferramenta oculos"`

### Passo 3: Iniciar servidor
**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

### Passo 4: Descobrir o IP do seu computador
**Windows:**
```bash
ipconfig
```
Procure por "IPv4" (exemplo: 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Procure por "inet" (exemplo: 192.168.1.100)

### Passo 5: Acessar no celular
1. Certifique-se que o celular está na mesma rede Wi-Fi
2. Abra o navegador no celular
3. Digite: `http://SEU_IP:8000`
   - Exemplo: `http://192.168.1.100:8000`

---

## Opção 2: Usar VS Code Live Server

Se você usa VS Code:

1. Instale a extensão "Live Server"
2. Clique com botão direito no `index.html`
3. Selecione "Open with Live Server"
4. O servidor iniciará automaticamente
5. Use o IP mostrado no terminal para acessar no celular

---

## Opção 3: Usar ngrok (Acesso de qualquer lugar)

1. Baixe ngrok: https://ngrok.com/download
2. Inicie um servidor local (Opção 1)
3. Em outro terminal, execute:
```bash
ngrok http 8000
```
4. Copie a URL fornecida (ex: https://abc123.ngrok.io)
5. Acesse essa URL no celular (funciona mesmo fora da sua rede)

---

## Opção 4: Enviar arquivos para o celular

1. Envie todos os arquivos (index.html, app.js, styles.css, *.png) para o celular
2. Use um app como "File Manager" no Android ou "Files" no iOS
3. Abra o index.html com um navegador
   - **Nota:** Algumas funcionalidades podem não funcionar (câmera, por exemplo)

---

## ⚠️ Importante

- **Câmera:** Só funciona com HTTPS ou localhost
- **Mesma rede:** Para servidor local, celular e PC devem estar na mesma Wi-Fi
- **Firewall:** Pode precisar permitir o Python no firewall do Windows

---

## 🚀 Solução Rápida (Windows)

1. Abra PowerShell na pasta do projeto
2. Execute:
```powershell
python -m http.server 8000
```
3. Anote o IP que aparece
4. No celular, acesse: `http://SEU_IP:8000`

