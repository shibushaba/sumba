export type ImposterCategory =
  | 'food'
  | 'animals'
  | 'places'
  | 'movies'
  | 'objects'
  | 'technology'
  | 'sports'
  | 'everyday'

export interface ImposterWord {
  word: string
  category: ImposterCategory
}

export const categoryLabels: Record<ImposterCategory, string> = {
  food: 'Food',
  animals: 'Animals',
  places: 'Places',
  movies: 'Movies',
  objects: 'Objects',
  technology: 'Technology',
  sports: 'Sports',
  everyday: 'Everyday Life',
}

const foodWords = [
  'Pizza', 'Burger', 'Biryani', 'Ice Cream', 'Chocolate', 'Mango', 'Popcorn',
  'Pasta', 'Sushi', 'Tacos', 'Pancakes', 'Sandwich', 'Noodles', 'Donut',
  'Samosa', 'Salad', 'Steak', 'Curry',
]

const animalWords = [
  'Elephant', 'Tiger', 'Penguin', 'Monkey', 'Dolphin', 'Giraffe', 'Kangaroo',
  'Panda', 'Eagle', 'Lion', 'Turtle', 'Rabbit', 'Whale', 'Fox', 'Owl', 'Horse',
  'Shark', 'Camel',
]

const placeWords = [
  'Beach', 'Airport', 'Hospital', 'School', 'Cinema', 'Mountain', 'Library',
  'Museum', 'Park', 'Restaurant', 'Stadium', 'Hotel', 'Market', 'Temple',
  'Bridge', 'Island', 'Desert', 'Zoo',
]

const movieWords = [
  'Titanic', 'Avatar', 'Inception', 'Frozen', 'Jaws', 'Rocky', 'Gladiator',
  'Coco', 'Shrek', 'Matrix', 'Jumanji', 'Aladdin', 'Batman', 'Tarzan', 'Moana',
  'Up', 'Cars', 'Interstellar',
]

const objectWords = [
  'Umbrella', 'Backpack', 'Mirror', 'Chair', 'Watch', 'Camera', 'Lamp',
  'Pillow', 'Bicycle', 'Guitar', 'Notebook', 'Wallet', 'Key', 'Clock',
  'Blanket', 'Sunglasses', 'Hammer', 'Balloon',
]

const technologyWords = [
  'Laptop', 'Phone', 'Robot', 'Keyboard', 'Internet', 'Headphones', 'Tablet',
  'Drone', 'Printer', 'Television', 'Microphone', 'Charger', 'Satellite',
  'Bluetooth', 'Camera', 'Router', 'Smartwatch', 'Console',
]

const sportsWords = [
  'Football', 'Cricket', 'Basketball', 'Tennis', 'Boxing', 'Swimming', 'Hockey',
  'Golf', 'Volleyball', 'Badminton', 'Cycling', 'Skiing', 'Surfing', 'Wrestling',
  'Archery', 'Rugby', 'Baseball', 'Karate',
]

const everydayWords = [
  'Morning', 'Birthday', 'Wedding', 'Rain', 'Sleep', 'Vacation', 'Traffic',
  'Homework', 'Shopping', 'Cooking', 'Cleaning', 'Weekend', 'Holiday',
  'Meeting', 'Laundry', 'Commute', 'Sunset', 'Breakfast',
]

function toEntries(words: string[], category: ImposterCategory): ImposterWord[] {
  return words.map((word) => ({ word, category }))
}

export const imposterWords: ImposterWord[] = [
  ...toEntries(foodWords, 'food'),
  ...toEntries(animalWords, 'animals'),
  ...toEntries(placeWords, 'places'),
  ...toEntries(movieWords, 'movies'),
  ...toEntries(objectWords, 'objects'),
  ...toEntries(technologyWords, 'technology'),
  ...toEntries(sportsWords, 'sports'),
  ...toEntries(everydayWords, 'everyday'),
]
