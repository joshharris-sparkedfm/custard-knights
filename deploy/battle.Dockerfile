FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY game/mass-battle.js game/mass-battle-wire.js ./game/
COPY server/mass-battle-server.cjs ./server/
ENV NODE_ENV=production CK_BATTLE_HOST=0.0.0.0 CK_BATTLE_PORT=8787 CK_BATTLE_ORIGINS=custard://game
USER node
EXPOSE 8787
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:8787/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/mass-battle-server.cjs"]
