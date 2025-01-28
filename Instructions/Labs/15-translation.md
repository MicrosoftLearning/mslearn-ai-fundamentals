---
lab:
    title: 'Explore Azure AI Translator in Azure AI Foundry'
---

# Explore Azure AI Translator in Azure AI Foundry

Artificial Intelligence (AI) can help simplify translation between languages, helping to remove barriers to communication across countries and cultures.

To test the capabilities of Azure AI Translator service, we'll take a look at it in action in Azure AI Foundry portal, Microsoft's platform for creating intelligent applications. The same principles and functionality apply in real-world solutions, such as web sites or phone apps.

## Create a project in Azure AI Foundry portal

1. In a browser tab, navigate to [Azure AI Foundry](https://ai.azure.com?azure-portal=true).

1. Sign in with your account. 

1. On the Azure AI Foundry portal home page, select **Create a project**. In Azure AI Foundry, projects are containers that help organize your work.  

    ![Screenshot of Azure AI Foundry home page with create a project selected.](./media/azure-ai-foundry-home-page.png)

1. On the *Create a project* pane, you will see a generated project name, which you can keep as-is. Depending on whether you have created a hub in the past, you will either see a list of *new* Azure resources to be created or a drop-down list of existing hubs. If you see the drop-down list of existing hubs, select *Create new hub*, create a unique name for your hub, and select *Next*.  
 
    ![Screenshot of the create a project pane with automaticly generated names for hub and project.](./media/azure-ai-foundry-create-project.png)

    > **Important**: You will need an Azure AI services resouce provisioned in a specific location to complete the rest of the lab.

1. In the same *Create a project* pane, select **Customize** and select one of the following **Locations**: *East US, France Central, Korea Central, West Europe, or West US* to complete the rest of the lab. Then select **create**. 

1. Take note of the resources that are created: 
    - Azure AI services
    - Azure AI hub
    - Azure AI project
    - Storage account
    - Key vault
    - Resource group  
 
1. After the resources are created, you will be brought to your project's *Overview* page. On the left-hand menu on the screen, select **AI Services**.
 
    ![Screenshot of the left-hand menu on the project screen with AI Services selected.](./media/azure-ai-foundry-ai-services.png)  

1. On the *AI Services* page, select the *Language + Translator* tile to try out Azure AI Translator capabilities.

    ![Screenshot of the language and translator tile selected on the AI Services page.](./media/language-translator-tile.png)

## Generate captions for an image

1. On the *Language + Translator* page, scroll down and select **Translation** under *Explore Language capabilities*. Then select the **Text translation** tile.

1. In the *Try it* section of the Overview page, under the *From: Auto detect* section, type the text `Welcome to Azure AI Fundamentals`. Notice the JSON that appears in correspondence in the *View request* section. 

1. In the *View response* section, view the JSON. Behind the scenes, a *request* has been sent to the Translator service. The *response* includes the detected source language with a confidence score, a translation using the alphabet of the output language, and an output language code. 

1. The demo in the *Try it* section shows what it would look like if you created a simple translation application with a user interface. In the case of the demo, as soon as you type in text, a request is made to the Translator service. How could you make this request? Check out the *Sample Code* tab. Here you see examples of code in different programming languages that could be used to make the request. 

1. Identify the lines in the code samples where you need to include your Translator service's **Key** and **Endpoint**. With your key and endpoint, you would be able to send a request to the Translator service, and receive a response like you saw in the demo. 

1. Navigate to the left hand menu. Under *Resource Management*, select *Keys and Endpoint*. If you were to build an application, you would find your key and endpoint here. 

## Clean-up

1. Delete your resource once you are done using it. 

## Learn more

To learn more about what you can do with this service, see the [Translator page](https://learn.microsoft.com/en-us/azure/ai-services/translator/translator-overview).
