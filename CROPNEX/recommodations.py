import streamlit as st
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Configure API key
genai.configure(api_key="AIzaSyDeB1WI1OHOViKXMXTjlBrl1eZr63yqQvM")

# Model configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Initialize the model
model_bot = genai.GenerativeModel(
    model_name="gemini-1.5-pro-002",
    generation_config=generation_config,
)

# Streamlit app
st.title("Agricultural Recommendation System")
st.subheader("Environmental Analysis and Recommendations")

# Input Section
st.write("Provide the geographical and environmental details of the region:")
message = (
    "You are an environmentalist tasked with examining the environmental status of a city named madanapalli, "
    "Madanapalle is the city in Annamayya district and Rajampet Lok Sabha constituency of the Indian state of Andhra Pradesh. It is a Selection Grade Municipality and largest City in Annamayya District. Madanapalle is headquarters of Madanapalle Mandal,Madanapalle revenue division and PKM Urban Development Authority.\n\n"
    """Geographical Status of Madanapalli"""
    """It is located at an average elevation of 695 m (2,280 ft) above mean sea level.[7]

Madanapalle is located at 13.55°N 78.50°E.[8]

Climate data for Madanapalle
Month	Jan	Feb	Mar	Apr	May	Jun	Jul	Aug	Sep	Oct	Nov	Dec	Year
Mean daily maximum °C (°F)	27.3
(81.1)	30.2
(86.4)	33.4
(92.1)	34.9
(94.8)	35
(95)	  32.1
(89.8)	30.2
(86.4)	30.1
(86.2)	29.9
(85.8)	28.6
(83.5)	26.8
(80.2)	25.7
(78.3)	30.4
(86.6)
Mean daily minimum °C (°F)	15.5
(59.9)	16.8
(62.2)	19.4
(66.9)	22.2
(72.0)	23.6
(74.5)	22.8
(73.0)	21.8
(71.2)	21.8
(71.2)	21.2
(70.2)	20.2
(68.4)	17.8
(64.0)	15.6
(60.1)	19.9
(67.8)
Average precipitation mm (inches)	4
(0.2)	2
(0.1)	3
(0.1)	28
(1.1)	61
(2.4)	51
(2.0)	81
(3.2)	73
(2.9)	111
(4.4)	143
(5.6)	54
(2.1)	32
(1.3)	643
(25.4)
[citation needed]
Source : Climate[9]

Madanapalle has mild to warm summers with average high temperatures of 30 to 35 °C (86 to 95 °F). Temperatures do not exceed 40 °C (104 °F) and winters are cold with temperatures between 7 and 15 °C (45 and 59 °F). Usually summer lasts from March to June, with the advent of rainy season in June, followed by winter which lasts till the end of February."""

    "*Tasks:*\n"
    
    "3. *Agricultural Recommendations*:\n"
    "   - Based on the soil examination report, provide a detailed schedule and a list of crops suitable for cultivation by farmers in the region.\n"
    "   - Include strategies to improve agricultural productivity while maintaining environmental sustainability.\n\n"

    "*Output Format:*\n"
    "{\n"
     
    '  "Agricultural Recommendations": {\n'
    '    "Recommended Crops": [\n'
    '      {"Crop": "Crop Name", "Reason": "Suitability based on soil and weather"}\n'
    "    ],\n"
    '    "Cultivation Schedule": [\n'
    '      {"Month": "Month Name", "Crop": "Crop Name", "Activities": "Details of farming activities"}\n'
    "    ]\n"
    "  }\n"
    "}\n"
    "just give the output in table format as markdrown"

)

if st.button("Generate Recommendations"):
    st.write("Processing...")
    chat_session = model_bot.start_chat()
    response = chat_session.send_message(
            [message],
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            },
        )
    st.subheader("Generated Recommendations")
    st.text(response.text)

   
st.write("---")

