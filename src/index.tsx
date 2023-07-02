import React, { useState, FormEvent } from "react"
import { createRoot } from "react-dom/client"
import classnames from "classnames"

import logo from "./assets/images/logo.svg"
import arrowDownIcon from "./assets/images/icon-arrow-down.svg"
import moonIcon from "./assets/images/icon-moon.svg"

import "./index.css"

const fontTypes = {
  serif: "serif",
  sans: "sans-serif",
  mono: "mono",
}

type Word = {
  value: string,
  phonetic: string,
  audio?: string,
  meanings: Array<{
    partOfSpeech: string,
    definitions: Array<{
      value: string,
      example?: string,
    }>,
    synonyms: string[],
  }>,
  sourceUrls: string[],
}

const App = () => {
  const [query, setQuery] = useState("")
  const [font, setFont] = useState(fontTypes.sans)
  const [word, setWord] = useState<Word>({
    value: "keyboard",
    phonetic: "/ˈkiːbɔːd/",
    audio: "https://api.dictionaryapi.dev/media/pronunciations/en/keyboard-us.mp3",
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          { value: "(etc.) A set of keys used to operate a typewriter, computer etc.", },
          { value: "A component of many instruments including the piano, organ, and harpsichord consisting of usually black and white keys that cause different tones to be produced when struck.", },
          { value: "A device with keys of a musical keyboard, used to control electronic sound-producing devices which may be built into or separate from the keyboard device.", },
        ],
        synonyms: ["electronic keyboard"],
      },
      {
        partOfSpeech: "verb",
        definitions: [
          {
            value: "To type on a computer keyboard.",
            example: "Keyboarding is the part of this job I hate the most.",
          },
        ],
        synonyms: [],
      },
    ],
    sourceUrls: [
      "https://en.wiktionary.org/wiki/keyboard",
      "https://en.wiktionary.org/wiki/keyboard",
    ],
  });

  type APIResponse = Array<{
    word: string,
    phonetic: string,
    phonetics: Array<{
      text: string,
      audio: string,
      sourceUrl?: string,
      license?: {
        name: string,
        url: string,
      },
    }>
    meanings: Array<{
      partOfSpeech: string,
      definitions: Array<{
        definition: string,
        synonyms: string[],
        antonyms: string[],
        example?: string,
      }>,
      synonyms: string[],
      antonyms: string[],
    }>,
    license: {
      name: string,
      url: string,
    },
    sourceUrls: string[],
  }>

  const search = (word:string) => {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => response.json())
      .then((response:APIResponse) => {
        const data = response[0]

        let partialResult:Partial<Word> = {
          value: data.word,
          phonetic: data.phonetic,
          sourceUrls: data.sourceUrls,
        }

        const phoneticWithAudio = data.phonetics.find((phonetic) => {
          return phonetic.audio !== ""
        })
        if (phoneticWithAudio) {
          partialResult.audio = phoneticWithAudio.audio
        }

        partialResult.meanings = data.meanings.map((meaning:any) => {
          return {
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions.map((definition:any) => {
              let result:any = {
                definition: definition.definition,
              }

              if (definition.example) {
                result.example = definition.example
              }

              return result
            }),
            synonyms: meaning.synonyms,
          }
        })

        const result:Word = partialResult as Word
        setWord(result)
      })
  }

  const handleSubmit = (e:FormEvent) => {
    e.preventDefault()
    search(query)
  }

  return (
    <div className={classnames("p-6 max-w-3xl mx-auto", {
      "font-serif": font === fontTypes.serif,
      "font-sans": font === fontTypes.sans,
      "font-mono": font === fontTypes.mono,
    })}>
      <div className="flex justify-between">
        <img src={logo} className="w-7" />
        <div className="flex items-center">
          <button type="button" className="h-full px-4 flex items-center">
            <span className="text-14 font-bold">
              {font === fontTypes.serif && "Serif"}
              {font === fontTypes.sans && "Sans Serif"}
              {font === fontTypes.mono && "Mono"}
            </span>
            <img src={arrowDownIcon} className="w-3 ml-4" />
          </button>
          {/* <select 
            onChange={(e) => setFont(e.target.value)}
            value={font}
          >
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="mono">Mono</option>
          </select> */}
          <button type="button" className="h-full pl-4 border-l border-light-gray flex items-center">
            <div className="w-10 h-5 px-1 flex items-center bg-grayish-blue rounded-full">
              <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
            </div>
            <img src={moonIcon} className="ml-3 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-6 flex">
        <form onSubmit={(e:FormEvent) => handleSubmit(e)}>
          <input 
            type="text" 
            className="w-full border" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="">S</button>
        </form>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div>
          <p className="font-bold">{word.value}</p>
          <p>{word.phonetic}</p>
        </div>
        <div>
          Play
        </div>
      </div>
      {word.meanings.map((meaning, index) => (
        <div key={index}>
          <p className="mt-7">{meaning.partOfSpeech}</p>
          <div className="mt-8">
            <p>Meaning</p>
            <ul>
              {meaning.definitions.map((definition, index) => (
                <li key={index}>
                  <p>{definition.value}</p>
                  {definition.example && (
                    <p>{definition.example}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {(meaning.synonyms.length > 0) && (
            <p className="mt-6">
              <span>Synonyms</span>
              <span className="ml-6">
                {meaning.synonyms.map((synonym, index) => (
                  <button
                    type="button"
                    onClick={() => search(synonym)}
                    key={index}
                  >
                    {synonym}
                  </button>
                ))}
              </span>
            </p>
          )}
        </div>
      ))}
      {(word.sourceUrls.length > 0) && (
        <div className="mt-8 border-t">
          <p>Source</p>
          {word.sourceUrls.map((url, index) => (
            <p key={index}>
              <a href={url} target="_blank">{url}</a>
              <span>R</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const container = document.getElementById("app")
const root = createRoot(container)
root.render(<App />)