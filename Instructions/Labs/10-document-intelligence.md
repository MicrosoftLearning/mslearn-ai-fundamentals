---
lab:
    title: 'Extract data from documents in Azure AI Foundry portal​'
---

# Extract data from documents in Azure AI Foundry portal

**Azure AI Document Intelligence** service enables you to analyze and extract information from forms and documents, then identify field names and data. 

How does Document Intelligence build upon optical character recognition (OCR)? While OCR can read printed or handwritten documents, OCR extracts text in an unstructured format which is difficult to store in a database or analyze. Document intelligence makes sense of the unstructured data by capturing the structure of the text, such as data fields and information in tables. 

In this exercise, you will use Azure AI Document Intelligence's prebuilt models in Azure AI Foundry portal, Microsoft's platform for creating intelligent applications, to recognize data from a receipt. 

## Create a project in Azure AI Foundry portal

1. In a web browser, open the [Azure AI Foundry portal](https://ai.azure.com) at `https://ai.azure.com` and sign in using your Azure credentials. Close any tips or quick start panes that are opened the first time you sign in. 

1. In the browser, navigate to `https://ai.azure.com/managementCenter/allResources` and select **Create**. Then choose the option to create a *new AI hub resource*.

1. In the *Create a project* wizard, enter a valid name for your project, and if an existing hub is suggested, select the option to create a *new* one. 

1. Expand *Advanced options* to specify the following settings for your project:
    - **Subscription**: Your Azure subscription
    - **Resource group**: Create or select a resource group
    - **Region**: Select one of the following locations:
        * East US
        * France Central
        * Korea Central
        * West Europe
        * West US

    Wait for your project and hub to be created.

1. When the project is created, you will be taken to an *Overview* page of the project details. Select **AI services** on the left-hand menu. 

1. On the *AI Services* page, select the *Vision + Document* tile to try out Azure AI Vision and Document capabilities.

    ![Screenshot of the Vision + Document tile in Azure AI Foundry.](./media/vision-document-tile.png)

## Analyze a receipt with Azure AI Document Intelligence in Azure AI Foundry 

You are now ready to analyze a receipt for the fictitious Northwind Traders retail company.

1. On the *Vision + Document* page, scroll down and select **Document**. Under *Prebuilt models for specific documents*, select the **Receipts** tile.

1. In the drop-down list under *Try it out*, note that your Azure AI services resource is selected. Leave it as-is.

1. On your computer, use [**https://aka.ms/mslearn-receipt**](https://aka.ms/mslearn-receipt) to open a sample image of a receipt. Save it in your Downloads folder or to your Desktop. 
 
1. In Azure AI Foundry, on the *Receipts* page, select **Browse for files** and navigate to the folder where you saved the picture. Select the picture of the receipt and then **Open**. The image appears on the left side of the screen.

    ![Screenshot of a northwind receipt.](media/document-intelligence/receipt.jpg)

1. On the right, select **Run analysis**.

1. When the analysis has run, the results are returned. Notice that the service has recognized specific data fields such as the merchant’s name, the address, phone number, and the transaction date and time, as well as the line items, subtotal, tax, and total amounts. Next to each field is a percentage probability that the field is correct.

    ![Screenshot of receipt analysis result in Azure AI Foundry portal, showing bounding boxes around data fields and he text in those extracted fields.](media/receipt-lab-result.png)

In this exercise you have used Azure AI Document Intelligence's prebuilt receipts model in Azure AI Foundry portal. From the results that were returned, you saw how Document Intelligence was able to identify specific fields, enabling data from everyday documents to be more easily processed. Before you close the demo, why not try some of the sample receipts, including those in different languages?

## Clean up

If you don’t intend to do more exercises, delete any resources that you no longer need. This avoids accruing any unnecessary costs.

1. Open the [Azure portal]( https://portal.azure.com) and select the resource group that contains the resource you created.
1. Select the resource and select **Delete** and then **Yes** to confirm. The resource is then deleted.

## Learn more

This exercise demonstrated only some of the capabilities of the AI Document Intelligence service. To learn more about what you can do with this service, see the [Document Intelligence](https://learn.microsoft.com/azure/ai-services/document-intelligence/overview?view=doc-intel-3.1.0) page.
