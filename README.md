# World Language Map Project

## Team Members
1. Yanbing Chen

2. Maggie Lehane

3. Qianheng Zhang


## Final Proposal
### Persona/Scenario
The following user persona describes the use of “Forgotten Tongues: Interactive Atlas of Extinct Languages” by Ally Brown, a freshman college student taking a LANG 101 course, Intro to World Languages. Ally was given an assignment to use this tool to explore and learn about extinct languages around the world. While Ally is from the United States, she is not very familiar with native languages in the United States and their endangerment level. Ally wants to filter the data through a search to only extinct languages within the United States. Through this she will be able to develop insights on patterns and trends within the endangerment level. Ally is curious if the most endangered languages have any spatial similarities, her goal is to identify any patterns, trends, or clusters in language endangerment level. Ally is curious if there will be distinct patterns and trends within the language families of critically endangered languages. She wants to find out if any outliers exist within the endangerment levels and language families as well.

The following user scenario describes the use of “Forgotten Tongues: Interactive Atlas of Extinct Languages” by Ally Brown, a freshman college student taking a LANG 101 course, Intro to World Languages. As Ally begins her assignment to explore and learn about extinct languages around the world, she arrives on the main page of this interactive tool. She is prompted to use the search bar at the top of the web map to search for a specific country; as she is interested in native languages in the United States, she searches the United States. Once her search is complete, the map pans and zooms to focus on the United States and the dots classified by for language endangerment level. Ally can now identify the most engaged languages in the United States and identify if these languages are found in clusters or not. There is additional information in a side panel showing a chart of how many languages are in each endangerment level. Ally notices that there are some clusters of critically endangered languages in the United States and wants to identify any patterns or trends on the language families of these endangered languages (i.e., are the languages most engaged also related to each other linguistically). Ally can click on each dot to retrieve additional information about each language, including language family, in a separate side panel. With this additional information, Ally can identify any outliers, if one language that is critically endangered is from a completely different language family from the others.

### Requirement Documents
1. Representation

| # | Layer Title |Source (if applicable) |Symbolization|
| -------- | ------- |-------- | ------- |
| 1 | Languages |UNESCO, WALS, etc. | Points that show the location of where languages are being used |
| 2 | Basemap | Mapbox | Custom; minimalist; will show major cities, countries, states, etc. in the world |
| 3 | Population Size Legend | N/A | Shows the bubbles’ size by their population |
| 4 | Color Scheme legend | N/A | Shows the endangerment Indexes' color scheme |
| 5 | Summary Panel | N/A | A pie chart that shows the percentage of endangerment languages’ counts in different indexes. A bar chart shows the top 5 big language families |
| 6 | Language Info Panel | N/A | Shows detailed information of a language. Including its name, number of speakers, regions, description of location, etc. |
| 7 | Background Information | N/A | Shows the motivation, citations, and other relevant sources |

2. Interaction

| # | Function Title | Operator/Operand | Proposed Interaction |
| -------- | ------- | -------- | ------- |
| 1 | Query Panel | Search | Location. Search for a location(country name) and map zooms to that area; sidebar shows total |
| 2 | Endangerment level Toggle | Filter | Endangerment level. Check boxes that allow user to view the languages with specific endangerment index |
| 3 | Language Selection | Retrieve | Objects. Click item; when click info shows up on side panels including language family, number of speakers, etc. |
| 4 | Country Selection | Retrieve | Location. After search for a location from Query Panel, shows the summary of languages within that country |
| 5 | Expression Selection | Reexpress | Objects; Choose if want proportional symbols to show total number of speakers or color schemes for endangerment index |

### Hifi-Wireframe


###
##### Dataset:
* [The World Atlas of Language Structures (WALS)](https://www.kaggle.com/datasets/averkij/wals-dataset)
The World Atlas of Language Structures (WALS) is a large database of structural (phonological, grammatical, lexical) properties of languages gathered from descriptive materials (such as reference grammars).

* [UNESCO Endangered Language Project](https://www.endangeredlanguages.com/#/4/43.300/-2.104/0/100000/0/low/mid/high/unknown)
This project is an online resouce for sampling and researching endangered languages as well as a forum for advice and best practice for improving linguistic diversity.

* [World language family](https://www.kaggle.com/datasets/rtatman/world-language-family-map)
A comprehensive catalogue of the world's languages, language families and dialects.
