---
lab:
    title: 'Explore speech in the new Microsoft Foundry portal'
---

# Explore speech in the new Microsoft Foundry portal

In this exercise, use Microsoft's platform for creating AI applications, Microsoft Foundry, to interact with a generative AI model using speech. You'll explore Azure Speech' speech-to-text (STT) and text-to-speech (TTS) functionalities through an agentic application.

> **Note**: This exercise is designed to take you through the steps to train and test a model using the new Foundry portal. If you have an Azure subscription with sufficient permissions, you can provision a Foundry project and use that for the exercise. However, Foundry is designed for enterprise-scale machine learning solutions that involve huge volumes of data and cloud-based compute. If you don’t have access to Azure, or if you have limited time to complete the exercise, a browser-based Lab app that includes the core functionality of Azure Speech used in this exercise is also provided at `https://aka.ms/speech-playground`. While the user interface in web-based Lab is not identical to Foundry, it’s similar enough to make the transition to Foundry intuitive. Note that the web-based Lab app runs in the browser, so refreshing the page at any point will restart the app!

This exercise takes approximately **20** minutes.

## Create a project in Microsoft Foundry

1. In a web browser, open [Microsoft Foundry](https://ai.azure.com) at `https://ai.azure.com` and sign in using your Azure credentials. Close any tips or quick start panes that are opened the first time you sign in, and if necessary use the **Foundry** logo at the top left to navigate to the home page, which looks similar to the following image (close the **Help** pane if it's open):

    ![Screenshot of Microsoft Foundry home page with the new Foundry toggle highlighted.](./media/foundry-home-page-classic.png)

1. At the top of the screen, select the **New Foundry** toggle. 

1. To utilize the new Foundry user interface, you will need to create a project in a supported region. In the dropdown menu, select **Create a new project**. (*Note*: If other projects have been created in the subscription, and they are deployed in a supported region, then they will also appear in the drop down list.)

    ![Screenshot of project selection menu to access the new Foundry UI.](./media/create-project-new-foundry.png)

1. In the **Create a project** wizard, enter a valid name for your project. Then expand **Advanced options** to specify the following settings for your project:
    - **Foundry resource**: *Enter a valid name for your AI Foundry resource.*
    - **Subscription**: *Your Azure subscription*
    - **Resource group**: *Create or select a resource group*
    - **Region**: Select any of the **Foundry recommended** regions\*
    
    \**Model deployments are restricted by regional quotas. If you select a region in which you have insufficient available quota, you may need to select an alternative region for a new resource later.*

1. Select **Create**. Wait for your project to be created. It may take a few minutes.

## Navigate to Azure Speech - Voice Live 

1. Once your project is created, you are taken to the new Foundry home page. On the home page, navigate to the top right menu (you may need to expand the screen to see the menu options). Select **Build**. 

    ![Screenshot of how to navigate to the Build menu option.](./media/0126-new-foundry-home-build-selected.png)
  
1. On the *Build* page, select **Models**, then select **AI-services**. Note that the list of AI services is a small subset of all the AI capabilities available with Foundry Tools. From the list, select **Azure Speech - Voice Live** to try out *Voice Live* capabilities in the Speech Playground. 

    ![Screenshot of how to navigate to Speech Playground to test Azure Speech - Voice Live.](./media/0126-new-foundry-ai-services-voice-live.png)

The two fundamental speech capabilities that power voice-enabled applications are speech recognition (converting spoken words to text) and speech synthesis (converting text to natural-sounding speech). Voice live in the Speech Playground supports both speech recognition and speech synthesis, enabling you to have a voice-based conversation with the model. Voice live combines several Azure Speech capabilities. 

## Open the Speech Playground App

Let's start by chatting with a generative AI model. In this exercise, we’ll use a browser-based application to chat with the **Microsoft Phi 4 Mini** model; a small language model that is useful for general chat solutions in low bandwidth scenarios. 

1. In a web browser, the Azure Speech - Voice Live Speech Playground should be open. In the playground settings pane,  click through the samples and select **Start with Blank** to create your own assistant. 
 
1. In the playground settings pane, modify the **Generative AI model** the assistant uses. Select **Phi4 Mini (preview)** to use the *Microsoft Phi 4 mini* model. Select **Apply changes** to save the updates. 

1. View the Speech Playground app, which should look like this:

    ![Screenshot of Voice Live with Phi4 Mini and blanck chat selected.](./media/0126-new-foundry-blank-start.png) 

## Select a voice 

Text-to-speech solutions use voices to control the cadence, pronunciation, timbre, and other aspects of generated speech. The available voices depend on your browser and operating system.

1. In the configuration pane on the left, view the voices in the **Speech output** drop-down list.
 
1. Select any of the available voices, and use the Preview selected voice (▷) button to hear a sample of the voice.
 
1. When you have selected the voice you want to use, use the **Apply changes** button to activate it.

## Use speech to interact with the model

The app supports both speech recognition and speech synthesis, enabling you to have a voice-based conversation with the model.

1. In the Chat pane, use the **Start** button to start a conversation with the model. If prompted, allow access to the system microphone. The agent will introduce itself. 

1. When the app status is **Listening…**, say something like `"How does speech recognition work?"` and wait for a response.

    >**Tip**: If an error occurs or the app can’t detect any speech input, you can enter a text-based prompt. 

1. Verify that the app status changes to **Processing…**. The app will process the spoken input, using speech-to-text to convert your speech to text and submit it to the model as a prompt. 

    >**Tip**: the processing speed may be so fast that you do not actually see the status before it changes back to *Speaking*.

1. When the status changes to **Speaking…**, the app uses text-to-speech to vocalize the response from the model. To see the original prompt and the response as text, select the **cc** button on the bottom of the chat screen.

    ![Screenshot of the selected cc button to see the closed captions.](./media/0126-new-foundry-voice-show-text.png)

Azure Speech Voice Live is a service used to build real-time voice-based agents. The Azure Speech Voice Live capabilities in Microsoft Foundry include multi-turn real-time conversations with support for interruptions and background noise suppression.

1. To continue the conversation, submit a second spoken prompt, such as `"How does speech synthesis work?"`, and review the response.

    >**Tip**: Review the generative AI model's *Advanced settings*. Another way you can affect the model's responses is by configuring the *Temperature* of the response. The *temperature*, is a parameter that controls the randomness or creativity of the model's responses. When the model is set to a lower temperature, its responses are more predictable and factual. As the temperature increases, more variability and creativity are added. The higher temperature setting is useful for brainstorming, its conversational tone, and generating varied examples. If the temperature is too high however, it can result in responses that do not make much sense and aren't reliable.

## Review the code 

Now let's review the code that makes this web experience possible!

1. Select **Code** at the top of the chat screen. You should see Python code like this:  

    ![Screenshot of the start of the python code for the voice live app.](./media/0126-voice-live-code-start.png)

1. In lines `17-32` you can see the specific Azure Speech packages imported. Imported packages provide additional functionality and tools - in this case, additional functions and models that compliment the language model used to respond to the conversation text itself. By importing these packages, you can leverage prebuilt, optimized solutions instead of writing everything from scratch, making code more efficient, readable, and maintainable.  

    ![Screenshot of the imported packages.](./media/0126-voice-live-azure-imports.png)
 
1. The web live voice assistant is composed of two major functionalities: the Audio Processor and the Voice Assistant.  In lines `63-238`, you can review the code for the `AudioProcessor` class to see how it handles real-time audio capture and playback. 

    ![Screenshot of the Audio Processor class.](./media/0126-voice-live-audio-processor.png)

1. The `BasicVoiceAssistant` class begins on line `240`. The code in this class uses the VoiceLive Python SDK to handle the events from the VoiceLive connection. Notice how the `BasicVoiceAssistant` has a dependency on the `AudioProcessor` class (such as in line `258`).   

    ![Screenshot of the Voice Assistant class.](./media/0126-voice-live-basic-voice-assistant.png)

1. The configurations from the playground settings and your credentials (such as AI voice, model, and instructions) are handled by the global `parse_arguments` function that starts on line `417`.

    ![Screenshot of parse arguments function.](./media/0126-voice-live-parse-arguments.png)

1. Click on **{X}.env variables** at the top of the code screen to your VoiceLive credentials.

    ![Screenshot of the env variables.](./media/0126-voice-live-env.png)

1. Stitched all together, we can understand what is executed with the `main` function that starts on line `472`: 
    - Your Azure credentials are validated (*notice how parse_arguments() is saved to the variable `args`*)
    - Your client is created
    - The voice assistant is created (*notice how the assistant is created on line `497` by calling the `BasicVoiceAssistant`*)
    - The voice assistant is given code for proper shutdown
    - The voice assistant is started 

    ![Screenshot of the main function](./media/0126-voice-live-main-function.png)

Now you have reviewed the code, the next step is to try and implement it yourself. We suggest you explore running it in VS Code on your own if you have the necessary access. 

## Clean up

If you don’t intend to do more exercises, delete any resources that you no longer need. This avoids accruing any unnecessary costs.

1. Open the **Azure portal** at [https://portal.azure.com](https://portal.azure.com) and select the resource group that contains the resources you created.
1. Select **Delete resource group** and then **enter the resource group name** to confirm. The resource group is then deleted.