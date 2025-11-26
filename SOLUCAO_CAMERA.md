# 📷 Solução para Câmera no Celular

## ⚠️ Problema
A câmera não funciona em HTTP. Navegadores móveis exigem HTTPS por segurança.

## ✅ Solução 1: Usar ngrok (Recomendado - Mais Fácil)

### Passo 1: Baixar ngrok
1. Acesse: https://ngrok.com/download
2. Baixe para Windows
3. Extraia o arquivo `ngrok.exe`

### Passo 2: Criar conta gratuita
1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta gratuita
3. Copie seu authtoken (aparece na página inicial)

### Passo 3: Configurar ngrok
1. Coloque o `ngrok.exe` em uma pasta fácil (ex: `C:\ngrok\`)
2. Abra PowerShell como Administrador
3. Execute:
```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken SEU_TOKEN_AQUI
```

### Passo 4: Iniciar túnel
Com o servidor Python rodando na porta 3000, em outro terminal execute:
```powershell
cd C:\ngrok
.\ngrok.exe http 3000
```

### Passo 5: Acessar no celular
1. O ngrok mostrará uma URL como: `https://abc123.ngrok-free.app`
2. Use essa URL no celular
3. A câmera funcionará! 🎉

---

## ✅ Solução 2: Usar mkcert (Local, mais complexo)

Cria certificado SSL local. Mais trabalhoso, mas funciona offline.

---

## ✅ Solução 3: Usar a função "Enviar Imagem"

Enquanto não configura HTTPS, você pode:
1. Tirar uma foto com a câmera do celular
2. Usar o botão "🖼️ Enviar Imagem"
3. Testar os óculos na foto

---

## 🚀 Solução Rápida (ngrok sem instalar)

Se tiver Node.js instalado:
```bash
npx ngrok http 3000
```

Isso baixa e executa o ngrok temporariamente.

---

## 📝 Notas Importantes

- **HTTPS é obrigatório** para câmera em dispositivos móveis
- **ngrok é gratuito** para uso pessoal
- A URL do ngrok muda a cada execução (na versão gratuita)
- Para URL fixa, precisa da versão paga do ngrok

