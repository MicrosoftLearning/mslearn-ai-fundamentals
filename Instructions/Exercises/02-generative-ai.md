---
lab:
    title: 'Explore generative AI in Azure AI Foundry portal'
---

# Explore generative AI in Azure AI Foundry Portal

Generative AI describes a category of capabilities within AI that create content. People typically interact with generative AI that has been built into chat applications. In this exercise, you try out generative AI in Azure AI Foundry portal, Microsoft's platform for creating intelligent applications. 

This exercise takes approximately **20** minutes.

## Create a project in Azure AI Foundry portal

1. In a web browser, open the [Azure AI Foundry portal](https://ai.azure.com) at `https://ai.azure.com` and sign in using your Azure credentials. Close any tips or quick start panes that are opened the first time you sign in. 

1. In the browser, navigate to `https://ai.azure.com/managementCenter/allResources` and select **Create new**. Then choose the option to create an **Azure AI Foundry resource**.

1. In the *Create a project* wizard, enter a valid name for your project.

1. Expand *Advanced options* to specify the following settings for your project:
    - **Subscription**: Your Azure subscription
    - **Resource group**: Create or select a resource group
    - **Region**: Select one of the following locations:
        * East US
        * France Central
        * Korea Central
        * West Europe
        * West US

    Select **Create**. Wait for your project to be created. It may take a few minutes.

1. When the project is created, you will be taken to an *Overview* page of the project details.

1. On the left-hand menu on the screen, select **Playgrounds**. 

    >*Note*: Expand the menu to read its contents by clicking on the top 'expand' icon.

## Explore generative AI in Azure AI Foundry's chat playground

1. In Azure AI Foundry's Playgrounds page, select **Try the Chat playground**. The Chat playground is a user interface that enables you to try out building a chat application with different generative AI models.  

    >*Note*: If you do not see the *Setup* pane appear on the Chat playground screen, expand the window size.  

1. In order to use Chat playground, you need to associate it with a deployed model. In the Chat playground's *Setup* pane, select **+ Create a deployment**. If prompted, select *From base models*, otherwise continue to the next step. 

1. Search for the **gpt-4o** model, then select **Confirm**. Keep the default model name, deployment type, and deployment details. Then select **Deploy**.

1. In the chat playground, you can use your deployed model when it appears in the *Deployment* selection menu. Close any tips or quick start panes that are opened. 

    >*Note*: You need to select **Apply changes** anytime you make changes to *Setup*. 

1. Navigate to the *Chat history* pane. You will use the query box to enter your prompts. 

1. Consider the following ways you can improve responses from a generative AI assistant:
    - Start with a specific goal for what you want the assistant to do
    - Iterate based on previous prompts and responses to refine the result
    - Provide a source to ground the response in a specific scope of information
    - Add context to maximize response appropriateness and relevance
    - Set clear expectations for the response

1. Let's try generating a response using a prompt with a specific goal. In the chat box, enter the following prompt:

    ```prompt
    I'm planning a trip to Paris in September. Can you help me?
    ```

1. Review the response. **Note**: Keep in mind that the specific response you receive may vary due to the nature of generative AI.
 
1. Let's try another prompt. Enter the following:

    ```prompt
    Where's a good location in Paris to stay? 
    ```

1. Review the response, which should provide some places to stay in Paris.

1. Let's iterate based on previous prompts and responses to refine the result. Enter the following prompt:
    
    ```prompt
    Can you give me more information about dining options near the first location?
    ``` 

1. Review the response, which should provide dining options near a location from the previous response. 

1. Now, let's provide a source to ground the response in a specific scope of information. Enter the following: 
    
    ```prompt
    Based on the information at https://en.wikipedia.org/wiki/History_of_Paris, what were the key events in the city's history?
    ```

1. Review the response, which should provide information based on the provided website. 

1. Let's try to add context to maximize the relevance of the response. Enter the following prompt: 

    ```prompt
    What three places do you recommend I stay in Paris to be within walking distance to historical attractions? Explain your reasoning.
    ```

1. Review the response and reasoning for the response.  

1. Now try setting clear expectations for the response. Enter the following prompt:
    
    ```prompt
    What are the top 10 sights to see in Paris? Answer with a numbered list in order of popularity.
    ```

1. Review the response, which should provide a numbered list of sights to see in Paris.

1. When you are done, you can close the browser window.

## Clean up

If you don’t intend to do more exercises, delete any resources that you no longer need. This avoids accruing any unnecessary costs.

1. Open the **Azure portal** at [https://portal.azure.com](https://portal.azure.com) and select the resource group that contains the resources you created.

1. Select the resources and select **Delete** and then **Yes** to confirm. The resources are then deleted.
