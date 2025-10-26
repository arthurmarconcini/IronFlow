// src/utils/translationUtils.ts

// Mapeamento de Body Parts (Partes do Corpo)
const bodyPartTranslations: { [key: string]: string } = {
  back: 'Costas',
  cardio: 'Cardio',
  chest: 'Peito',
  'lower arms': 'Antebraços',
  'lower legs': 'Panturrilhas',
  neck: 'Pescoço',
  shoulders: 'Ombros',
  'upper arms': 'Braços',
  'upper legs': 'Pernas',
  waist: 'Abdômen',
}

// Mapeamento de Equipment (Equipamentos)
const equipmentTranslations: { [key: string]: string } = {
  assisted: 'Assistido',
  band: 'Faixa',
  barbell: 'Barra',
  'body weight': 'Peso Corporal',
  'bosu ball': 'Bola Bosu',
  cable: 'Cabo',
  dumbbell: 'Haltere',
  'elliptical machine': 'Elíptico',
  'ez barbell': 'Barra EZ',
  hammer: 'Hammer',
  kettlebell: 'Kettlebell',
  'leverage machine': 'Máquina',
  'medicine ball': 'Bola Medicinal',
  'olympic barbell': 'Barra Olímpica',
  'resistance band': 'Faixa de Resistência',
  roller: 'Rolo',
  rope: 'Corda',
  'skierg machine': 'Máquina de Ski',
  'sled machine': 'Sled',
  'smith machine': 'Máquina Smith',
  'stability ball': 'Bola de Estabilidade',
  'stationary bike': 'Bicicleta Ergométrica',
  'stepmill machine': 'Máquina de Escada',
  strongman: 'Strongman',
  tire: 'Pneu',
  'trap bar': 'Barra Hexagonal',
  'upper body ergometer': 'Ergômetro de Braço',
  weighted: 'Com Peso',
  'wheel roller': 'Roda Abdominal',
}

type TranslationCategory = 'bodyPart' | 'equipment'

/**
 * Traduz um termo de uma categoria específica.
 * @param term O termo em inglês a ser traduzido.
 * @param category A categoria do termo ('bodyPart' ou 'equipment').
 * @returns O termo traduzido em português ou o termo original se não houver tradução.
 */
export const translateTerm = (
  term: string,
  category: TranslationCategory,
): string => {
  const lowerCaseTerm = term.toLowerCase()
  switch (category) {
    case 'bodyPart':
      return bodyPartTranslations[lowerCaseTerm] || term
    case 'equipment':
      return equipmentTranslations[lowerCaseTerm] || term
    default:
      return term
  }
}
