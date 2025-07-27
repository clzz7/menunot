import os from 'os';

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const networkInterface of interfaces[name]) {
      // Pular interfaces internas e IPv6
      if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
        return networkInterface.address;
      }
    }
  }
  
  return 'localhost';
}

const networkIP = getNetworkIP();
console.log('\n🌐 Informações de Rede:');
console.log('='.repeat(50));
console.log(`📍 IP da Rede Local: ${networkIP}`);
console.log(`🖥️  Acesso Local: http://localhost:5173`);
console.log(`🌍 Acesso na Rede: http://${networkIP}:5173`);
console.log(`🔗 API Local: http://localhost:5000`);
console.log(`🔗 API na Rede: http://${networkIP}:5000`);
console.log('='.repeat(50));
console.log('\n📱 Para acessar de outros dispositivos:');
console.log(`   Use: http://${networkIP}:5173`);
console.log('\n🔥 Certifique-se de que o firewall permite conexões na porta 5173 e 5000\n');

export { getNetworkIP };