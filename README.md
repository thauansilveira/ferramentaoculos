# 🕶️ Ferramenta para Provar Óculos Virtual

Uma aplicação web moderna que permite testar diferentes modelos de óculos virtualmente usando sua webcam.

## ✨ Funcionalidades

- 📹 **Captura de vídeo em tempo real** - Use sua webcam para ver como ficam os óculos
- 🕶️ **Múltiplos modelos de óculos** - Escolha entre diferentes estilos (Aviador, Redondo, Quadrado, Gatinho, Esportivo, Vintage)
- ⚙️ **Ajustes personalizados** - Controle tamanho, posição e rotação dos óculos
- 📸 **Captura de fotos** - Salve suas fotos com os óculos para comparar
- 💾 **Galeria de fotos** - Visualize e gerencie todas as fotos capturadas
- 📱 **Design responsivo** - Funciona perfeitamente em desktop e mobile

## 🚀 Como Usar

1. **Abra o arquivo `index.html`** no seu navegador
2. **Clique em "Iniciar Câmera"** e permita o acesso à webcam quando solicitado
3. **Escolha um modelo de óculos** clicando na galeria
4. **Ajuste os controles** para posicionar os óculos perfeitamente:
   - **Tamanho**: Ajuste o tamanho dos óculos
   - **Posição X/Y**: Mova os óculos horizontalmente e verticalmente
   - **Rotação**: Gire os óculos para melhor alinhamento
5. **Capture fotos** clicando em "Capturar Foto"
6. **Visualize suas fotos** na galeria abaixo

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (com gradientes e animações modernas)
- JavaScript (ES6+)
- Webcam API (getUserMedia)
- Canvas API (para captura de fotos)
- LocalStorage (para salvar fotos)

## 📋 Requisitos

- Navegador moderno com suporte a:
  - Webcam API
  - Canvas API
  - LocalStorage
- Webcam conectada e funcionando
- Permissão para acessar a câmera

## 🎨 Modelos de Óculos

A ferramenta usa imagens PNG para os modelos de óculos. Atualmente está configurada para usar `oculos.png`.

### Como Adicionar Mais Modelos de Óculos

1. Coloque o arquivo PNG do óculos na mesma pasta do projeto
2. Abra o arquivo `app.js`
3. No array `glassesModels`, adicione um novo objeto:

```javascript
{
    id: 'nome-unico',
    name: 'Nome do Óculos',
    image: 'nome-do-arquivo.png'
}
```

Exemplo:
```javascript
const glassesModels = [
    {
        id: 'oculos',
        name: 'Óculos',
        image: 'oculos.png'
    },
    {
        id: 'oculos2',
        name: 'Óculos Esportivo',
        image: 'oculos-esportivo.png'
    }
];
```

## 💡 Dicas

- Certifique-se de ter boa iluminação para melhor visualização
- Use os controles de ajuste para posicionar os óculos corretamente no seu rosto
- As fotos são salvas localmente no navegador (LocalStorage)
- Você pode deletar fotos clicando no botão "×" em cada foto

## 🔒 Privacidade

- Todas as imagens são processadas localmente no seu navegador
- Nenhuma imagem é enviada para servidores externos
- As fotos são armazenadas apenas no seu navegador (LocalStorage)

## 📝 Notas

- A ferramenta funciona melhor em ambientes bem iluminados
- Para melhor experiência, use um navegador moderno (Chrome, Firefox, Edge, Safari)
- As fotos são salvas em formato PNG de alta qualidade

## 🎯 Próximas Melhorias Possíveis

- Detecção facial automática para posicionamento inteligente
- Mais modelos de óculos
- Filtros e efeitos adicionais
- Compartilhamento de fotos
- Exportação de fotos em diferentes formatos

---

Desenvolvido com ❤️ para ajudar você a escolher o óculos perfeito!

