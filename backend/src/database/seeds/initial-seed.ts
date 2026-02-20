import dataSource from '../data-source';
import * as bcrypt from 'bcrypt';

export async function initialSeed() {
  try {
    console.log('🌱 Starting database seeding...');

    await dataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    // 0. Clean up existing data
    console.log('🧹 Cleaning up old data...');
    await queryRunner.query(`
      TRUNCATE TABLE
        tenants, users, contacts, channels, tags, pipelines, pipeline_stages, deals, quick_replies, conversations, messages
      RESTART IDENTITY CASCADE
    `);
    console.log('✅ Old data cleaned');

    // 1. Create Demo Tenant
    console.log('📦 Creating demo tenant...');
    const tenantResult = await queryRunner.query(`
      INSERT INTO tenants (name, slug, email, phone, status, subscription_plan)
      VALUES ('Dialogix Demo', 'dialogix-demo', 'demo@dialogix.com.br', '+5511999999999', 'active', 'professional')
      RETURNING id
    `);
    const tenantId = tenantResult[0].id;
    console.log(`✅ Tenant created: ${tenantId}`);

    // 2. Create Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await queryRunner.query(`
      INSERT INTO users (tenant_id, name, email, password, role, status)
      VALUES ($1, 'Admin Dialogix', 'admin@dialogix.com.br', $2, 'admin', 'active')
      RETURNING id
    `, [tenantId, hashedPassword]);
    const adminId = adminResult[0].id;
    console.log(`✅ Admin user created: admin@dialogix.com.br / admin123`);

    // 3. Create Agent User
    console.log('👤 Creating agent user...');
    const agentPassword = await bcrypt.hash('agent123', 10);
    const agentResult = await queryRunner.query(`
      INSERT INTO users (tenant_id, name, email, password, role, status)
      VALUES ($1, 'Agent Demo', 'agent@dialogix.com.br', $2, 'agent', 'active')
      RETURNING id
    `, [tenantId, agentPassword]);
    const agentId = agentResult[0].id;
    console.log(`✅ Agent user created: agent@dialogix.com.br / agent123`);

    // 4. Create Demo Contacts
    console.log('📇 Creating demo contacts...');
    const contacts = [];
    for (let i = 1; i <= 10; i++) {
      const contactResult = await queryRunner.query(`
        INSERT INTO contacts (tenant_id, name, email, phone, company, status)
        VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING id
      `, [
        tenantId,
        `Cliente Demo ${i}`,
        `cliente${i}@example.com`,
        `+5511${String(i).padStart(9, '9')}`,
        i % 3 === 0 ? 'Empresa ABC' : i % 2 === 0 ? 'Tech Corp' : 'StartUp XYZ',
      ]);
      contacts.push(contactResult[0].id);
    }
    console.log(`✅ ${contacts.length} contacts created`);

    // 5. Create Demo Channel (WhatsApp)
    console.log('📱 Creating demo channel...');
    const channelResult = await queryRunner.query(`
      INSERT INTO channels (tenant_id, name, type, status, phone_number, is_default)
      VALUES ($1, 'WhatsApp Principal', 'whatsapp', 'connected', '+5511987654321', true)
      RETURNING id
    `, [tenantId]);
    const channelId = channelResult[0].id;
    console.log(`✅ Channel created: ${channelId}`);

    // 6. Create Tags
    console.log('🏷️  Creating tags...');
    const tagColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const tagNames = ['VIP', 'Prospecção', 'Cliente', 'Follow-up', 'Suporte'];
    const tags = [];
    for (let i = 0; i < tagNames.length; i++) {
      const tagResult = await queryRunner.query(`
        INSERT INTO tags (tenant_id, name, color)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [tenantId, tagNames[i], tagColors[i]]);
      tags.push(tagResult[0].id);
    }
    console.log(`✅ ${tags.length} tags created`);

    // 7. Create Demo Pipeline
    console.log('🎯 Creating sales pipeline...');
    const pipelineResult = await queryRunner.query(`
      INSERT INTO pipelines (tenant_id, name, description, is_default)
      VALUES ($1, 'Pipeline de Vendas', 'Pipeline padrão de vendas', true)
      RETURNING id
    `, [tenantId]);
    const pipelineId = pipelineResult[0].id;

    // 8. Create Pipeline Stages
    const stages = [
      { name: 'Prospecção', color: '#6b7280', probability: 10, position: 0 },
      { name: 'Qualificação', color: '#3b82f6', probability: 30, position: 1 },
      { name: 'Proposta', color: '#f59e0b', probability: 50, position: 2 },
      { name: 'Negociação', color: '#8b5cf6', probability: 75, position: 3 },
      { name: 'Fechado', color: '#10b981', probability: 100, position: 4 },
    ];

    const stageIds = [];
    for (const stage of stages) {
      const stageResult = await queryRunner.query(`
        INSERT INTO pipeline_stages (pipeline_id, name, color, probability, position)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [pipelineId, stage.name, stage.color, stage.probability, stage.position]);
      stageIds.push(stageResult[0].id);
    }
    console.log(`✅ ${stageIds.length} pipeline stages created`);

    // 9. Create Demo Deals
    console.log('💰 Creating demo deals...');
    const dealTitles = [
      'Implementação Sistema CRM',
      'Consultoria Digital',
      'Desenvolvimento Website',
      'Migração Cloud',
      'Suporte Técnico Anual',
    ];

    for (let i = 0; i < dealTitles.length; i++) {
      await queryRunner.query(`
        INSERT INTO deals (tenant_id, pipeline_id, stage_id, contact_id, assigned_to, title, value, currency, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'BRL', 'open')
      `, [
        tenantId,
        pipelineId,
        stageIds[i % stageIds.length],
        contacts[i],
        i % 2 === 0 ? adminId : agentId,
        dealTitles[i],
        (i + 1) * 5000,
      ]);
    }
    console.log(`✅ ${dealTitles.length} deals created`);

    // 10. Create Quick Replies
    console.log('⚡ Creating quick replies...');
    const quickReplies = [
      { shortcut: '/ola', message: 'Olá! Como posso ajudá-lo hoje?' },
      { shortcut: '/horario', message: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.' },
      { shortcut: '/obrigado', message: 'Muito obrigado pelo contato! Estamos à disposição.' },
    ];

    for (const qr of quickReplies) {
      await queryRunner.query(`
        INSERT INTO quick_replies (tenant_id, shortcut, message, is_active)
        VALUES ($1, $2, $3, true)
      `, [tenantId, qr.shortcut, qr.message]);
    }
    console.log(`✅ ${quickReplies.length} quick replies created`);

    // 11. Create Conversations
    console.log('💬 Creating demo conversations...');
    const conversations = [];
    // Create a conversation for the first 3 contacts
    for (let i = 0; i < 3; i++) {
      const conversationResult = await queryRunner.query(`
        INSERT INTO conversations (tenant_id, contact_id, channel_id, assigned_to, status)
        VALUES ($1, $2, $3, $4, 'open')
        RETURNING id
      `, [
        tenantId,
        contacts[i],
        channelId,
        i % 2 === 0 ? agentId : adminId, // Alternate assignment
      ]);
      conversations.push(conversationResult[0].id);
    }
    console.log(`✅ ${conversations.length} conversations created`);

    // 12. Create Messages for Conversations
    console.log('📜 Creating demo messages...');
    const conversationMessages = [
      // Convo 1
      [
        { direction: 'incoming', body: 'Olá, tudo bem? Gostaria de um orçamento.' },
        { direction: 'outgoing', body: 'Olá! Claro, para qual serviço seria?' },
        { direction: 'incoming', body: 'Seria para o plano Pro. Vocês têm desconto anual?' },
        { direction: 'outgoing', body: 'Temos sim! O plano anual tem 20% de desconto.' },
      ],
      // Convo 2
      [
        { direction: 'incoming', body: 'Oi, estou com um problema no meu login.' },
        { direction: 'outgoing', body: 'Bom dia. Lamento por isso. Qual e-mail você está usando?' },
      ],
      // Convo 3 (longer)
      [
        { direction: 'incoming', body: 'Boa tarde, recebi a proposta de vocês.' },
        { direction: 'outgoing', body: 'Ótimo! Ficou alguma dúvida?' },
        { direction: 'incoming', body: 'Nenhuma, está tudo certo. Podemos fechar.' },
        { direction: 'outgoing', body: 'Maravilha! Vou preparar o contrato e te envio em seguida.' },
        { direction: 'incoming', body: 'Perfeito, fico no aguardo. Obrigado!' },
      ]
    ];

    let totalMessages = 0;
    for (let i = 0; i < conversations.length; i++) {
      const convoId = conversations[i];
      const messages = conversationMessages[i];
      const assignedUserId = i % 2 === 0 ? agentId : adminId;
      const contactId = contacts[i];

      for (const msg of messages) {
        const senderId = msg.direction === 'incoming' ? contactId : assignedUserId;
        const senderType = msg.direction === 'incoming' ? 'contact' : 'user';
        await queryRunner.query(`
          INSERT INTO messages (tenant_id, conversation_id, body, sender_type, sender_id)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          tenantId,
          convoId,
          msg.body,
          senderType,
          senderId,
        ]);
        totalMessages++;
      }
    }
    console.log(`✅ ${totalMessages} messages created`);

    await queryRunner.release();
    await dataSource.destroy();

    console.log('');
    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@dialogix.com.br / admin123');
    console.log('   Agent: agent@dialogix.com.br / agent123');
    console.log('');
    console.log('🎯 Demo Data:');
    console.log(`   Tenant: Dialogix Demo`);
    console.log(`   Contacts: 10`);
    console.log(`   Tags: 5`);
    console.log(`   Pipeline Stages: 5`);
    console.log(`   Deals: 5`);
    console.log(`   Conversations: 3`);
    console.log(`   Messages: ${totalMessages}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}
