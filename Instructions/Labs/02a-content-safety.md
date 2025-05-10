# Explore Content Safety in Azure AI Foundry

Azure AI services help users create AI applications with out-of-the-box and pre-built and customizable APIs and models. In this exercise you will take a look at one of the services, Azure AI Content Safety, which enables you to moderate text and image content. In Azure AI Foundry portal, Microsoft's platform for creating intelligent applications, you will use Azure AI Content Safety to categorize text and assign it severity score. 

> **Note**
> The goal of this exercise is to get a general sense of how Azure AI services are provisioned and used. Content Safety is used as an example, but you are not expected to gain a comprehensive knowledge of content safety in this exercise!

## Create a project in Azure AI Foundry portal

1. In a browser tab, navigate to the [Azure AI Foundry portal](https://ai.azure.com?azure-portal=true).

2. Sign in with your account. 

3. On the Azure AI Foundry portal home page, select **Create a project**. In Azure AI Foundry, projects are containers that help organize your work.  

    ![Screenshot of Azure AI Foundry home page with create a project selected.](./media/azure-ai-foundry-home-page.png)

4. On the *Create a project* pane, you will see a generated project name, which you can keep as-is. Depending on whether you have created a hub in the past, you will either see a list of *new* Azure resources to be created or a drop-down list of existing hubs. If you see the drop-down list of existing hubs, select *Create new hub*, create a unique name for your hub, and select *Next*.  
 
    ![Screenshot of the create a project pane with automaticly generated names for hub and project.](./media/azure-ai-foundry-create-project.png)

> **Important**: You will need an Azure AI services resouce provisioned in a specific location to complete the rest of the lab.

5. In the same *Create a project* pane, select **Customize** and select one of the following **Locations**: East US, France Central, Korea Central, West Europe, or West US to complete the rest of the lab. Then select **create**. 

1. Take note of the resources that are created: 
- Azure AI services
- Azure AI hub
- Azure AI project
- Storage account
- Key vault
- Resource group  

6. After the resources are created, you will be brought to your project's *Overview* page. 

7. In order to use Content Safety, you need to make a permissions update to your *Azure AI hub* resource. To do this, open the [Azure portal](https://portal.azure.com?portal-azure=true) and log in with the same subscription you used to create your AI Foundry resources.  

8. In the Azure portal, use the search bar at the top of the page to look for and select **Azure AI Foundry**. In the  resource page, select the resource you just created that is *type* **Azure AI hub**.  

9. In the Azure portal, on the left-hand pane, select **Access Control (IAM)**. Then on the open pane, select **Add** next to the plus sign, and select **Add role assignment**. 

![Screenshot of where to select add role assignment in the Access Control pane.](./media/content-safety/access-control-step-one.png)

10. Search for **Azure AI Safety Evaluator** in the list of roles, and select it. Then select **Next**. 

11. Use the following settings to assign yourself to the role: 
    - **Assign access to**: select *user, group, or service principal*
    - **Members**: click on *select members*
        - On the open *Select members* pane, find your name. Click on the plus icon next to your name. Then click **Select**.
    - **Description**: *leave blank*

12. Select **Review and Assign**, then select **Review and Assign** again to add the role assignment.    

13. In your browser, return to the [Azure AI Foundry portal](https://ai.azure.com?azure-portal=true). Select your project. 

14. On the left-hand menu on the screen, select **AI Services**.
 
    ![Screenshot of the left-hand menu on the project screen with AI Services selected.](./media/azure-ai-foundry-ai-services.png)  

15. On the *AI Services* page, select the *Vision + Document* tile to try out Azure AI Vision and Document capabilities.
    
    ![Screenshot of the Content Safety tile.](./media/content-safety-tile.png)

## Try out text moderation with Content Safety in Azure AI Foundry portal 

1. On the *Content Safety* page, under *Filter text content*, select **Moderate text content**.

2. On the *Moderate text content* page, under the *Try it out* heading, select the Azure AI services resource you just created from the drop down menu.   

3. Under *Run a simple test*, select the **Safe Content** tile. Notice that text is displayed in the box below. 

4. Click **Run test**. Running a test calls the Content Safety Service's deep learning model. The deep learning model has already been trained to recognize un-safe content.

5. In the *Results* panel, inspect the results. There are four severity levels from safe to high, and four types of harmful content. Does the Content Safety AI service consider this sample to be acceptable or not? What's important to note is that the results are within a confidence interval. A well-trained model, like one of Azure AI's out-of-the-box models, can return results that have a high probability of matching what a human would label the result. Each time you run a test, you call the model again. 

6. Now try another sample. Select the text under Violent content with misspelling. Check that the content is displayed in the box below.

7. Click **Run test** and inspect the results in the Results panel again. 

You can run tests on all the samples provided, then inspect the results.

## Clean-up

If you don’t intend to do more exercises, delete any resources that you no longer need. This avoids accruing any unnecessary costs.

1. Open the [Azure portal]( https://portal.azure.com) and select the resource group that contains the resource you created.
1. Select the resource and select **Delete** and then **Yes** to confirm. The resource is then deleted.

## Learn more

This exercise demonstrated only some of the capabilities of the Content Safety service. To learn more about what you can do with this service, see the [Content Safety page](https://learn.microsoft.com/azure/ai-services/content-safety/overview).
