---
lab:
  title: Get started with voice agents in Microsoft Foundry
  description: Build and configure a voice agent with optimized instructions, audio settings, and test it in the playground.
  level: 200
  duration: 30 minutes
  islab: true
  primarytopics:
    - Microsoft Foundry
---

# Get started with voice agents in Microsoft Foundry

![Image of Anton.](./media/anton-icon.png)<br/>**Hi, I'm Anton.**<br/>I'll be here to help you with hints and tips as you work through this lab; in which you'll configure a voice agent in Microsoft Foundry. You'll learn how to set up listening and speaking layers, write instructions optimized for voice, and test your agent with realistic scenarios.

If you want more interactive help, you can chat with me in the *[Ask Anton](https://aka.ms/choose-anton){:target="_blank"}* app.

<details>
<strong><i><a href="https://aka.ms/choose-anton" target="_blank">Ask Anton</a></i></strong> is a generative AI agent that can answer questions about AI concepts and Microsoft Foundry technologies. It's available in two versions at <code>https://aka.ms/choose-anton</code>:
<ul>
<li><strong>Azure-based</strong>: Best experience <i>(requires an Azure subscription and deployment of a model in a Foundry project)</i>.</li>
<li><strong>Browser-based</strong>: Use a small language model in your browser <i>(reduced functionality - may be slow or work only in "basic" mode in older/lower-spec devices)</i>.</li>
</ul>
<blockquote><i>Ask Anton is <u>not</u> a supported Microsoft product or a component of Microsoft Learn or AI Skills Navigator.</i>
</blockquote>
</details>
<hr/>

This exercise should take approximately **30** minutes to complete.

> **Note**: Many components of Microsoft Foundry, including the Microsoft Foundry portal, are subject to continual development. This reflects the fast-moving nature of artificial intelligence technology. Some elements of your user experience may differ from the images and descriptions in this exercise!

## Create or open a Microsoft Foundry project

Microsoft Foundry uses *projects* to organize models, resources, data, and other assets used to develop an AI solution. You'll need a project to create your voice agent.

1. In a web browser, open [Microsoft Foundry](https://ai.azure.com){:target="_blank"} at `https://ai.azure.com` and sign in using your Azure credentials.
1. If you don't have an existing project, create a new project with a unique name, expanding the **Advanced options** area to specify:
    - **Foundry resource**: *A valid name for your Foundry resource.*
    - **Subscription**: *Your Azure subscription*
    - **Resource group**: *Create or select a resource group*
    - **Region**: Select any of the **AI Foundry recommended** regions in [this list](https://learn.microsoft.com/azure/foundry/openai/how-to/responses#supported-regions){:target="_blank"}

1. Once your project is ready, close any welcome dialogs and navigate to the **Build** section.

## Create a voice agent

Now you'll create a voice-based agent for a customer support scenario.

1. On the **Build** page, select the **Agents** tab, then select **Build an agent**.

2. Enter a name for your agent, such as `support-agent`.

3. Select **Voice** as the **Interaction mode** and enter a goal for the voice agent, such as "Provide customer support for Contoso Shop."

4. Select **Create agent and open playground**.

    Your agent opens in the agent playground.

## Configure the reasoning layer (instructions)

Voice agents need instructions written for *spoken* conversation, not text. Replace the template instructions with ones optimized for speech.

1. In the **Instructions** panel, clear the existing text and replace it with the following structure:

    ```
    ### Personality

    You are Alex, a friendly customer support agent for Contoso Shop. You're patient, helpful, and professional.

    ### Environment
    You're on a live phone call. The caller can only hear you. You have tools to look up orders and check account status. Always use your tools—never guess.

    ### Tone
    Keep your responses short and natural—one or two sentences. Use plain language, no jargon. Speak numbers as words (say "forty-five dollars," not "45 dollars"). Read back any important details before acting.

    ### Goal
    1. Greet the caller warmly
    2. Ask what they need help with
    3. Look up their order or account info using tools
    4. Resolve their issue or hand off to a human

    ### Guardrails
    - Never share account details before the caller verifies their identity
    - Only say what your tools tell you
    - If a tool fails, tell the caller and offer to retry or escalate
    - Hand off to a human if the caller asks or if you can't help
    ```

    > ![Image of Anton.](./media/anton-icon.png)<br/>**Tip**: This structure (Personality → Environment → Tone → Goal → Guardrails) is easier for the AI model to follow than a single paragraph, and it makes instructions easier to tune later.

1. Select **Save** to save your instructions.

## Configure the listening layer (audio input)

Configure how your agent hears and understands callers.

1. Scroll down to the **Advanced settings** button and select it.
1. Under **Input**:
    - **User transcript model**: Verify `Azure Speech` is selected for reliable, fast transcription.
    - **Language**: Verify `Auto-detect` is selected to support multiple languages.

1. Under **Automatic turn detection**:
    - Verify `Azure Semantic Multilingual` is selected for conversational scenarios. This understands when a caller finishes speaking, not just silence.

    > ![Image of Anton.](./media/anton-icon.png)<br/>**Tip**: Turn detection is critical. If it's too aggressive, your agent interrupts callers. Too passive, and it waits awkwardly. The semantic mode handles natural pauses in speech better.

1. Under **Audio enhancement**:
    - Ensure **Noise suppression** and **Echo cancellation** are both enabled to handle real-world phone environments.

2. Under **Conversational behavior**
    - Select **Interim response**.
    - Select **LLM-generated messages**.

    > ![Image of Anton.](./media/anton-icon.png)<br/>**Tip**: Interim responses are crucial if your agent calls tools that take more than 1.5 seconds. Without them, callers think the call dropped during the silence.

3. Use **Select** to save your changes.

## Configure the speaking layer (audio output)

Now configure how your agent sounds and handles latency.

1. Under **Voice** select the configuration button near the selected voice to open the advanced voice options.

2. In the **Advanced voice options**:
    - **Voice**: Select a standard Azure voice (e.g., "Ash" or "Alloy"). Preview it to make sure it sounds clear and professional.
    - **Playback speed**: Leave at `1.0` (normal speed).

3. Use **Select** to save your changes.

## Test your voice agent in the playground

Now it's time to test your agent with realistic scenarios.

1. At the top of the playground, select **Start session** and allow microphone access when prompted.

2. Test these scenarios (speak naturally, as if calling customer support):
    - **Greeting test**: Let the agent greet you. Does it sound natural?
    - **Turn detection test**: Ask a question, pause for 2–3 seconds mid-sentence, then continue. Does the agent wait patiently without interrupting?
    - **Interruption test**: While the agent is speaking, start talking. Does the agent recognize you and stop?
    - **Clarity test**: Say something ambiguous like `"I have a problem with my order."` Does the agent ask for clarification instead of guessing?

3. After testing, select **End session**.

## Summary

You've successfully built a voice agent by configuring three critical layers:

- **Listening**: Transcription and turn detection so the agent hears and understands callers.
- **Reasoning**: Instructions optimized for speech that guide the agent's behavior.
- **Speaking**: Voice and interim responses so the agent sounds natural and responsive.

Voice agents excel when all three layers work together. The insights you gained from testing and tracing your agent—recognizing turn detection latency, transcription misses, and latency issues—are the same skills you'll use to optimize production voice agents.

## Clean Up

If you've finished exploring Microsoft Foundry, delete the resources created in this exercise to avoid unnecessary charges.

1. Open the [Azure portal](https://portal.azure.com){:target="_blank"} at `https://portal.azure.com` and view your resource group.
1. On the toolbar, select **Delete resource group**.
1. Enter the resource group name and confirm deletion.

> ![Anton avatar.](./media/anton-icon.png)<br/>If you used the [*Ask Anton*](https://aka.ms/choose-anton){:target="_blank"}* app during this lab, we'd love to [hear about your experience](https://forms.office.com/r/fC0ndfBQeK){:target="_blank"}!
