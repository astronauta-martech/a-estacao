A Estação ganha instalador para Mac, Windows e Linux. Baixa, instala e abre numa janela própria, sem navegador, sem Terminal e sem Node.

## O que mudou

- **Instaladores.** `.dmg` para Mac com chip Apple e com Intel, `.exe` para Windows e `.AppImage` e `.deb` para Linux. Escolha o do seu sistema na lista abaixo.
- **Janela própria.** A Estação abre como um aplicativo, com o mesmo ícone do astronauta da página. Fechar a janela desliga tudo.
- **Linux.** Primeira versão para Linux, ainda em teste: a leitura das sessões e a sala dos servidores não foram conferidas, e a placa de vídeo não aparece.
- **Atualização pelo instalador.** Quando houver versão nova, a tela de novidades traz o link da página de releases. É só baixar e instalar por cima.
- Quem usa pelo código continua igual: `./atualizar.sh` no Mac e `atualizar.cmd` no Windows.

## Na primeira vez

Os instaladores ainda não são assinados, então o sistema avisa:

- **Mac:** se ele disser que não pode abrir, vá em Ajustes do Sistema > Privacidade e Segurança e clique em Abrir Mesmo Assim.
- **Windows:** em "O Windows protegeu o computador", clique em Mais informações e em Executar assim mesmo.
- **Linux:** dê permissão de execução ao `.AppImage` (`chmod +x`) antes de abrir.
