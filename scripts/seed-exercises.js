#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Carrega as variáveis de ambiente do arquivo .env no topo do script
require('dotenv').config()

const axios = require('axios')
const { initializeApp } = require('firebase/app')
const {
  getFirestore,
  collection,
  writeBatch,
  doc,
} = require('firebase/firestore')

// ========================================================================================
// Validação Crítica das Variáveis de Ambiente
// ========================================================================================

const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_RAPIDAPI_KEY',
  'EXPO_PUBLIC_TRANSLATION_API_KEY',
]

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ ERRO DE CONFIGURAÇÃO!')
  console.error(
    'As seguintes variáveis de ambiente estão faltando no seu arquivo .env:',
  )
  missingVars.forEach((varName) => console.error(`  - ${varName}`))
  console.error(
    '\nPor favor, adicione todas as variáveis necessárias ao arquivo .env e tente novamente.',
  )
  process.exit(1) // Encerra o script com um código de erro
}

// ========================================================================================
// Configuração
// ========================================================================================

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const EXERCISEDB_API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY
const TRANSLATION_API_KEY = process.env.EXPO_PUBLIC_TRANSLATION_API_KEY

const BATCH_SIZE = 400

// ========================================================================================
// Lógica do Script
// ========================================================================================

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const exerciseDbApi = axios.create({
  baseURL: 'https://exercisedb.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': EXERCISEDB_API_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
  },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const translateText = async (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') return text
  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATION_API_KEY}`
    const response = await axios.post(url, {
      q: text,
      source: 'en',
      target: 'pt',
      format: 'text',
    })
    return response.data.data.translations[0].translatedText
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message
    console.error(`Falha ao traduzir "${text}". Erro: ${errorMessage}`)
    return text // Retorna o original em caso de erro para não quebrar o fluxo
  }
}

const fetchAllExercises = async () => {
  const TOTAL_EXERCISES_TO_FETCH = 20; // Definir o total desejado para o teste
  console.log(
    `1. Buscando os primeiros ${TOTAL_EXERCISES_TO_FETCH} exercícios da ExerciseDB em modo paginado (10 por vez)...`,
  );
  let allExercises = [];
  let offset = 0;
  const limit = 10;

  // O loop continua enquanto não atingirmos o total desejado
  while (allExercises.length < TOTAL_EXERCISES_TO_FETCH) {
    try {
      process.stdout.write(
        `   - Buscando exercícios a partir do offset ${offset} (coletados: ${allExercises.length}/${TOTAL_EXERCISES_TO_FETCH})...\r`,
      );
      const response = await exerciseDbApi.get('/exercises', {
        params: { limit, offset },
      });

      if (response.data && response.data.length > 0) {
        allExercises = allExercises.concat(response.data);
        offset += limit;
        await sleep(200); // Pausa de 200ms entre as requisições para ser gentil com a API
      } else {
        // Se não vier mais dados, a API não tem mais exercícios, então paramos.
        console.log('\n   - A API não retornou mais exercícios.');
        break;
      }
    } catch (error) {
      console.error(
        `\n   - ❌ Erro ao buscar exercícios no offset ${offset}:`,
        error.response?.data,
      );
      // Em caso de erro, paramos para evitar problemas.
      break;
    }
  }

  // Garante que retornamos exatamente o número desejado, caso a API tenha menos que o total.
  const finalExercises = allExercises.slice(0, TOTAL_EXERCISES_TO_FETCH);

  console.log(
    `\n   - ✅ Total de ${finalExercises.length} exercícios encontrados.`,
  );
  return finalExercises;
};

const translateExercise = async (exercise) => {
  // Traduz campo por campo, de forma sequencial, para ser mais gentil com a API.
  const name = await translateText(exercise.name);
  const target = await translateText(exercise.target);
  const bodyPart = await translateText(exercise.bodyPart);
  const equipment = await translateText(exercise.equipment);

  const instructions = [];
  for (const instruction of (exercise.instructions || [])) {
    const translatedInstruction = await translateText(instruction);
    instructions.push(translatedInstruction);
  }

  const secondaryMuscles = [];
  for (const muscle of (exercise.secondaryMuscles || [])) {
    const translatedMuscle = await translateText(muscle);
    secondaryMuscles.push(translatedMuscle);
  }

  // Constrói a URL do GIF programaticamente
  const gifUrl = `https://v2.exercisedb.io/image/${exercise.id}`;

  return {
    id: exercise.id,
    name,
    bodyPart,
    equipment,
    gifUrl,
    target,
    instructions,
    secondaryMuscles,
    lastModified: new Date(),
  };
};

const main = async () => {
  try {
    const allExercises = await fetchAllExercises()

    console.log(
      '\n2. Traduzindo todos os exercícios para Português (isso pode levar vários minutos)...',
    )
    const translatedExercises = []
    for (let i = 0; i < allExercises.length; i++) {
      process.stdout
        .write(`   - Traduzindo ${i + 1} de ${allExercises.length}...\r`)
      const translated = await translateExercise(allExercises[i])
      translatedExercises.push(translated)
      await sleep(100); // PAUSA DE 100ms PARA EVITAR O RATE LIMIT
    }

    console.log('\n   - ✅ Tradução concluída.')
    console.log('\n3. Gravando exercícios no Firestore em lotes...')

    const exercisesCollection = collection(db, 'exercises')
    let batch = writeBatch(db)
    const totalBatches = Math.ceil(translatedExercises.length / BATCH_SIZE)

    for (let i = 0; i < translatedExercises.length; i++) {
      const exercise = translatedExercises[i]
      const docRef = doc(exercisesCollection, exercise.id)
      batch.set(docRef, exercise)

      if ((i + 1) % BATCH_SIZE === 0 || i === translatedExercises.length - 1) {
        const currentBatchNum = Math.ceil((i + 1) / BATCH_SIZE)
        console.log(
          `   - Enviando lote ${currentBatchNum} de ${totalBatches}...`,
        )
        await batch.commit()
        if (i !== translatedExercises.length - 1) {
          batch = writeBatch(db)
        }
      }
    }

    console.log('\n================================================')
    console.log('✅ SUCESSO! O Firestore foi populado com os exercícios.')
    console.log('================================================')
    process.exit(0)
  } catch (error) {
    console.error('\n================================================')
    console.error('❌ ERRO! Ocorreu um problema durante o seeding.')
    console.error(error)
    console.error('================================================')
    process.exit(1)
  }
}

main()
