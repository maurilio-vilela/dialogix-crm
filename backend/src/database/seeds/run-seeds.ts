import dataSource from '../data-source';
import * as bcrypt from 'bcrypt';
import { initialSeed } from './initial-seed'; // Importa a lógica do seed

async function run() {
  try {
    console.log('🌱 Starting database seeding process...');
    await initialSeed(); // Executa o seed importado
    console.log('✅ Seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during the seeding process:', error);
    process.exit(1);
  }
}

run();
