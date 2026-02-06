---
lab:
    title: 'Get started with computer vision in Microsoft Foundry'
    description: 'Use generative AI models to interpret and generate visual data.'
    level: 100
    duration: 30 minutes
---

# Get started with computer vision in Microsoft Foundry

In this exercise, you'll use generative AI models in Microsoft Foundry to work with visual data.

This exercise should take approximately **30** minutes to complete.

## Create a Microsoft Foundry project

Microsoft Foundry uses *projects* to organize models, resources, data, and other assets used to develop an AI solution.

1. In a web browser, open [Microsoft Foundry](https://ai.azure.com){:target="_blank"} at `https://ai.azure.com` and sign in using your Azure credentials. Close any tips or quick start panes that are opened the first time you sign in, and if necessary use the **Foundry** logo at the top left to navigate to the home page.
1. If it is not already enabled, in the tool bar the top of the page, enable the **New Foundry** option. Then, if prompted, create a new project with a unique name; expanding the  **Advanced options** area to specify the following settings for your project:
    - **Foundry resource**: *Enter a valid name for your AI Foundry resource.*
    - **Subscription**: *Your Azure subscription*
    - **Resource group**: *Create or select a resource group*
    - **Region**: Select any of the **AI Foundry recommended** regions

    ![Screenshot of the AI Foundry project home page.](./media/0-foundry-project.png)

## Use a generative AI model to analyze images

Computer vision models enable AI systems to interpret image-based data, such as photographs, videos, and other visual elements. In this exercise, you'll explore how the developer of an AI agent to help aspiring chefs could use a vision-enabled model to interpret images of ingredients and suggest relevant recipes.

1. In a new browser tab, download **[images.zip](https://microsoftlearning.github.io/mslearn-ai-fundamentals/data/images.zip){:target="_blank"}** `https://microsoftlearning.github.io/mslearn-ai-fundamentals/data/images.zip` to your local computer.
1. Extract the downloaded archive in a local folder to see the files it contains. These files are the images you will use AI to analyze.
1. Return to the browser tab containing your Microsoft Foundry project. Then, in the **Start building** menu, select **Browse models** to view the Microsoft Foundry model catalog.
1. Search for and deploy the `gpt-4.1-mini` model using the default settings. Deployment may take a minute or so.
1. When the model has been deployed, view the model playground page that is opened, in which you can chat with the model.

    ![Screenshot of the model playground.](./media/0-model-playground.png)

1. Use the button at the bottom of the left navigation pane to hide it and give yourself more room to work with.
1. In the pane on the left, set the **Instructions** to `You are an AI cooking assistant who helps chefs with recipes.`
1. In the chat pane, use the **Upload image** button to select one of the images you extracted on your computer. The image is added to the prompt area.

    You can select the image you have added to view it.

   ![Screenshot of a chat with an image in a prompt.](./media/0-image-input.png)

1. Enter prompt text like `What recipes can I use this in?` and submit the prompt, which contains both the uploaded image and the text.
1. Review the response, which should include relevant recipe suggestions for the image you uploaded.

   ![Screenshot of the chat app with the response to an image-based prompt.](./media/0-image-analysis.png)

1. Submit prompts that include the other images, such as `How should I cook this?` or `What desserts could I make with this?`

### View code

To develop a client app or agent that can use the model to interpret images, you can use the OpenAI **Responses** API.

1. In the **Chat** pane, select the **Code** tab to view sample code.
1. Select the following code options:
    - **API**: Responses API
    - **Language**: Python
    - **SDK**: OpenAI SDK
    - **Authentication**: Key authentication

    The default sample code includes only a text-based prompt. To submit a prompt that analyzes an image, you can modify the **input** parameter to include both text and image content, as shown here:

    ```python
    from openai import OpenAI
    
    endpoint = "https://your-project-resource.openai.azure.com/openai/v1/"
    deployment_name = "gpt-4.1-mini"
    api_key = "<your-api-key>"
    
    client = OpenAI(
        base_url=endpoint,
        api_key=api_key
    )
    
    response = client.responses.create(
        model=deployment_name,
        input=[{
            "role": "user",
            "content": [
                {"type": "input_text", "text": "what's in this image?"},
                {"type": "input_image", "image_url": "https://an-online-image.jpg"},
            ],
        }],
    )
    
    print(f"answer: {response.output[0]}")
    ```

    > **Tip**: If you are using a work or school account to sign into Azure, and you have sufficient permissions in the Azure subscription, you can open the sample code in VS Code for Web to experiment with image-based input content. You can obtain the **key** for your service in the **Code** tab of the model playground (above the sample code) and you can use the image **[orange.jpg](https://microsoftlearning.github.io/mslearn-ai-fundamentals/data/orange.jpg){:target="_blank"}** at `https://microsoftlearning.github.io/mslearn-ai-fundamentals/data/orange.jpg`. To learn more about using rhe OpenAI API to analyze images, see the [OpenAI documentation](https://platform.openai.com/docs/guides/images-vision#analyze-images).

## Use a generative AI model to create new images

So far you've explored the ability of a generative AI model to process visual input. Now let's suppose we want some appropriate images on a web site to support the AI chef agent. Let's see how a model can generate visual output.

1. Use the "back" arrow next to the **gpt-4.1-mini** header (or select the **Models** page in the navigation pane) to view the model deployments in your project.
1. Select **Deploy a base model** to open the model catalog.
1. In the **Collections** drop-down list, select **Direct from Azure**, and in the **Inference tasks** drop-down list, select **Text to image**. Then view the available models for image generation.

   ![Screenshot of image-generation models in the model catalog.](./media/0-image-generation-models.png)

    > **Note**: The available models in your subscription may vary. Additionally, the ability to deploy models depends on regional availabilty and quota.

1. Select the **FLUX-1-Kontext-pro** model and deploy it.

    *If you are unable to deploy the model in your subscription, try one of the other image-generation models.*

1. When the model has been deployed, it opens in the image playground.
1. Enter a prompt describing a desired image; for example `A chef preparing a meal.` Then review the generated image.

   ![Screenshot of the image playground with a generated image.](./media/0-generated-image.png)

### View code

If you want to develop a client app or agent that generates images using your model, you can use the OpenAI API.

1. In the **Chat** pane, select the **Code** tab to view sample code.
1. Select the following code options:
    - **Language**: Python
    - **SDK**: OpenAI SDK
    - **Authentication**: Key authentication

    The default sample code should look similar to this:

    ```python
    import base64
    from openai import OpenAI
    
    endpoint = "https://your-project-resource.openai.azure.com/openai/v1/"
    deployment_name = "FLUX.1-Kontext-pro"
    api_key = "<your-api-key>"
    
    client = OpenAI(
        base_url=endpoint,
        api_key=api_key
    )
    
    img = client.images.generate(
        model=deployment_name,
        prompt="A cute baby polar bear",
        n=1,
        size="1024x1024",
    )
    
    image_bytes = base64.b64decode(img.data[0].b64_json)
    with open("output.png", "wb") as f:
        f.write(image_bytes)
    ```

## Use a generative AI model to create video

In addition to static images, you may want to include video content on the AI Chef agent web site.

1. Use the "back" arrow next to the image-generation model header (or select the **Models** page in the navigation pane) to view the model deployments in your project.
1. Select **Deploy a base model** to open the model catalog.
1. In the **Collections** drop-down list, select **Direct from Azure**, and in the **Inference tasks** drop-down list, select **Video generation**. Then view the available models for video generation.

   ![Screenshot of video-generation models in the model catalog.](./media/0-video-generation-models.png)

    > **Note**: The available models in your subscription may vary. Additionally, the ability to deploy models depends on regional availabilty and quota.

1. Select the **Sora** model and deploy it.

    *If you are unable to deploy the model in your subscription, try one of the other video-generation models.*

1. When the model has been deployed, it opens in the video playground.
1. Enter a prompt describing a desired video; for example `A chef in a busy kitchen.` Then review the generated image.

   ![Screenshot of the video playground with a generated video.](./media/0-generated-video.png)

### View code

If you want to develop a client app or agent that generates videos using your model, you can use the REST API.

1. In the **Chat** pane, select the **Code** tab to view sample code.

    The default sample code uses the *curl* command to call the REST endpoint, and should look similar to this:

    ```bash
    curl -X POST "https://your-project-resource.openai.azure.com/openai/v1/video/generations/jobs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AZURE_API_KEY" \
    -d '{
        "prompt" : "A video of a cat",
         "height" : "1080",
         "width" : "1080",
         "n_seconds" : "5",
         "n_variants" : "1",
        "model": "sora"
        }'
    ```

## Summary

in this exercise, you explored the use of vision-enabled models in Microsoft Foundry, including models that can accept vision data as input, models that can generate static images based on text descriptions, and models that can generate video.