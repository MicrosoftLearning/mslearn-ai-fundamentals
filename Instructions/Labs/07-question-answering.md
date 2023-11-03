---
lab:
    title: 'Use Question Answering with Language Studio'
---

# Use Question Answering model with Language Studio

In this exercise you will use Language Studio to create and train a knowledge base of question and answers that will be used by a customer services bot. Content for the knowledge base will come from an existing FAQ page from the web site of Margie’s Travel, a fictitious travel agency. You will then use Language Studio to see how it would work when used by customers.

When implementing a bot, the first step is to create a knowledge base of question and answer pairs. This is used together with built-in natural language processing capabilities so that the bot can interpret questions and find the most appropriate answer for the user.

## Create a knowledge base

Azure AI Language includes *question answering* capabilities, which you will use to create a knowledge base. Knowledge bases can be created either by entering question and answer pairs manually, or from an existing document or web page. Margie’s Travel wants to use their existing FAQ document.

The Language service's question answering feature enables you to quickly create a knowledge base, either by entering question and answer pairs or from an existing document or web page. It can then use some built-in natural language processing capabilities to interpret questions and find appropriate answers.

1. In another browser tab, open the Azure portal at [https://portal.azure.com](https://portal.azure.com?azure-portal=true), signing in with the Microsoft account associated with your Azure subscription.

1. Click the **&#65291;Create a resource** button and search for *Language service*. Select **create** a **Language service** plan. You will be taken to a page to **Select additional features**. Use the following settings:
    - **Select Additional Features**:
        - **Default features**: *Keep the default features*.
        - **Custom features**: *Select custom question answering*.
     - Select **Continue to create your resource**
    ![Creating a Language Service resource with custom question answering enabled.](media/create-a-bot/create-language-service-resource.png)

1. On the **Create Language** page, specify the following settings:
    - **Project Details**
        - **Subscription**: *Your Azure subscription*.
        - **Resource group**: *Select an existing resource group or create a new one*.
    - **Instance Details**
        - **Region**: *Select a region*      
        - **Name**: *A unique name for your Language resource*.
        - **Pricing tier**: S (1K Calls per minute)
    - **Custom question answering**
        - **Azure search region**: *Any available location*.
        - **Azure search pricing tier**: Free F (3 Indexes) - (*If this tier is not available, select Basic*)
    - **Responsible AI Notice**
        - **By checking this box I certify that I have reviewed and acknowledge the terms in the Responsible AI Notice**: *Selected*.

1. Select **Review and Create** and then select **Create**. Wait for the deployment of the Language service that will support your custom question answering knowledge base.

    > **Note**
    > If you have already provisioned a free-tier **Azure Cognitive Search** resource, your quota may not allow you to create another one. In which case, select a tier other than **Free F**.

## Create a new project

1. In a new browser tab, open the Language Studio portal at [https://language.azure.com](https://language.azure.com?azure-portal=true) and sign in using the Microsoft account associated with your Azure subscription.
1. If prompted to choose a Language resource, select the following settings:
    - **Azure directory**: *The Azure directory containing your subscription*.
    - **Azure subscription**: *Your Azure subscription*.
    - **Language resource**: *The Language resource you created previously*.

    If you are ***not*** prompted to choose a language resource, it may be because you have multiple Language resources in your subscription; in which case:
    1. On the bar at the top if the page, select **Settings (&#9881;)**.      
    1. On the **Settings** page, view the **Resources** tab.
    1. Select the language resource you just created, and select **Switch resource**.
    1. At the top of the page, select **Language Studio** to return to the Language Studio home page.

1. At the top of the Language Studio portal, in the **Create new** menu, select **Custom question answering**.

    ![Custom question answering](media/create-a-bot/create-custom-question-answering.png)

1. On the **Choose language setting for resource *your resource*** page, select **I want to select the language when I create a project in this resource** and click **Next**.
  ![I want to select the language](media/create-a-bot/create-project.png)

1. On the **Enter basic information** page, enter the following details and click **Next**:
    - **Language resource**: *choose your language resource*.  
    - **Azure search resource**: *choose your Azure search resource*.
    - **Name**: `MargiesTravel`
    - **Description**: `A simple knowledge base`
    - **Source language**: English
    - **Default answer when no answer is returned**: `No answer found`
1. On the **Review and finish** page, select **Create project**.
1. You will be taken to the **Manage sources** page. Select **&#65291;Add source** and select **URLs**.
1. In the **Add URLs** box, select **+ Add url**. Type in the following and select **Add all**:
    - **URL name**: `MargiesKB`
    - **URL**: `https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-fundamentals/main/data/natural-language/margies_faq.docx`
    - **Classify file structure**: *Auto-detect*
1. Select **Add all.**  

 ![Add URL](media/create-a-bot/add-url.png)

## Edit the knowledge base

Your knowledge base is based on the details in the FAQ document and some pre-defined responses. You can add custom question-and-answer pairs to supplement these.

1. Expand the left panel and select **Edit knowledge base**. Then select **+** to add a new question pair.
1. In the **Add a new question answer pair** dialog box, in the **Question** type `Hello`, and in the **Answer** type `Hi`, then select **Done**.
1. Expand **Alternate questions** and select **+ Add alternate question**. Then enter `Hiya`as an alternative phrasing for "Hello".
1. At the top of the **Question answer pairs** pane, select **Save** to save your knowledge base.

## Train and test the knowledge base

Now that you have a knowledge base, you can test it.

1. At the top of the **Question answer pairs** pane, select **Test** to test your knowledge base.
1. In the test pane, at the bottom enter the message `Hi`. The response *Hi* should be returned.
1. In the test pane, at the bottom enter the message `I want to book a flight`. An appropriate response from the FAQ should be returned.

    > **Note**
    > The response includes a *short answer* as well as a more verbose *answer passage* - the answer passage shows the full text in the FAQ document for the closest matched question, while the short answer is intelligently extracted from the passage. You can control whether the short answer is from the response by using the **Display short answer** checkbox at the top of the test pane.

1. Try another question, such as `How can I cancel a reservation?`
1. When you're done testing the knowledge base, select **Test** to close the test pane.

## Create a bot for the knowledge base

The knowledge base provides a back-end service that client applications can use to answer questions through some sort of user interface. Commonly, these client applications are bots. To make the knowledge base available to a bot, you must publish it as a service that can be accessed over HTTP. You can then use the Azure Bot Service to create and host a bot that uses the knowledge base to answer user questions.

1. In the left panel, select **Deploy knowledge base**.
1. At the top of the page, select **Deploy**. A dialogue box will ask if you want to deploy the project. Select **Deploy**.

 ![Deploy knowledge base.](media/create-a-bot/deploy-knowledge-base.png)

1. After the service has been deployed, select **Create a bot**. This opens the Azure portal in a new browser tab so you can create a Web App Bot in your Azure subscription.
1. In the Azure portal, create a **Web App Bot**. (You may see a warning message to check that the source of the template is trustworthy. You do not need to take any action for that message.) Continue by updating the following settings:

    - **Project Details**
        - **Subscription**: *Your Azure subscription*
        - **Resource group**: *The resource group containing your Language resource*
    - **Instance details**
        - **Resource group Location**: *The same location as your Language service*.
    - **Azure Bot**
        - **Bot handle**: *A unique name for your bot* (*pre-populated*)
    - **Choose your pricing tier**
        - **Pricing tier**: Free (F0) (You may need to select *Change plan*)
    - **Microsoft App ID**
        - **Creation type**: *Select **Create new User-assigned managed identity*** 

5. Select **Next** to continue updating the settings. 
    - **App Service**
        - **App name**: *Same as the **Bot handle** with **.azurewebsites.net** appended automatically*
        - **SDK language**: *Choose either C# or Node.js*
    - **App Service Plan**
        - **Creation Type**: *Select **Create new app service plan***
    - **App Settings**
        - **Language Resource Key**: *You will need to copy your Language resource key and paste it here*:
            - Open another browser tab and navigate to the Azure portal at [https://portal.azure.com](https://portal.azure.com?azure-portal=true).
            - Browse to your Language service resource.
            - On the **Keys and Endpoint** page, copy one of the keys
            - Paste it here.
        - **Language project name**: MargiesTravel
        - **Language service endpoint hostname**: *Pre-populated with your language service endpoint*
    - **Language service details**
        - **Subscription Id**: *Pre-populated with your subscription ID*
        - **Resource Group Name**: *Pre-populated with your resource group name*
        - **Account Name**: *Pre-populated with your resource name*

1. Select **Create**. Then  wait for your bot to be created (the notification icon at the top right, which looks like a bell, will be animated while you wait). Then in the notification that deployment has completed, select **Go to resource** (or alternatively, on the home page, click **Resource groups**, open the resource group where you created the bot, and select the **Azure bot** resource.)
1. In the left-hand pane of your bot look for **Settings**, select on **Test in Web Chat**, and wait until the bot displays the message **Hello and Welcome** (it may take a few seconds to initialize).
1. Use the test chat interface to ensure your bot answers questions from your knowledge base as expected. For example, try submitting `I need to cancel my hotel`.

Experiment with the bot. You'll probably find that it can answer questions from the FAQ quite accurately, but it will have limited ability to interpret questions that it has not been trained with. You can always use the Language Studio to edit the knowledge base to improve it, and republish it.

## Clean up

If you don’t intend to do more exercises, delete any resources that you no longer need. This avoids accruing any unnecessary costs.

1. Open the [Azure portal]( https://portal.azure.com) and select the resource group that contains the resource you created. 
1. Select the resource and select **Delete** and then **Yes** to confirm. The resource is then deleted.

## Learn more

- To learn more about the Question Answering service, view [the documentation](https://docs.microsoft.com/azure/cognitive-services/language-service/question-answering/overview).
- To learn more about the Microsoft Bot Service, view [the Azure Bot Service page](https://azure.microsoft.com/services/bot-service/).
