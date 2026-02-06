# Explore Automated Machine Learning

In this exercise, you'll use the automated machine learning to train and evaluate a machine learning model. You'll then deploy and test the trained model.

> **Note**: This exercise is designed to take you through the steps to train and test a model using ***Azure Machine Learning***. If you have an Azure subscription with sufficient permissions, you can provision an Azure Machine Learning workspace and use that for the exercise. However,  Azure Machine Learning is designed for enterprise-scale machine learning solutions that involve huge volumes of data and cloud-based compute. Some operations in Azure Machine Learning require provisioning compute, which can take considerable time. If you don't have access to Azure, or if you have limited time to complete the exercise, a browser-based ***ML Lab*** app that includes the core functionality of Azure ML used in this exercise is also provided, and you can use that to train and test real machine learning models, just as you would in Azure ML. While the user interface in ML Lab is not *identical* to Azure Machine Learning, it's similar enough to make the transition to Azure Machine Learning intuitive. Note that the ML Lab app runs in the browser, so refreshing the page at any point will restart the app!

This exercise should take approximately **35** minutes to complete (less if you use the browser-based ML Lab app).

## Create a workspace

A workspace is used to keep all your machine learning resources together, making it easier to manage data, code, models, and other assets in a single place.

1. Open the portal for the environment you want to use in this lab, and sign in if prompted:
    - Azure-based [Azure Machine Learning Studio](https://ml.azure.com){:target="_blank"} at `https://ml.azure.com`
    - Browser-based [ML Lab](https://aka.ms/ml-lab){:target="_blank"} at `https://aka.ms/ml-lab`

    > **Tip**: If Azure Machine Learning studio opens in an existing workspace, navigate to the **All workspaces** page.

1. Create a new workspace with a suitable name.

    If you are using Azure Machine Learning, you do not require a *Hub* for this exercise. Choose appropriate advanced settings based on any policy constraints in your Azure subscription.

1. After the workspace has been created, select it to view its **Home** page.

    Note that the workspace has multiple pages, which are displayed in the navigation pane on the left. You can expand and collapse this pane by using the **&#9776;** menu at the top.

## Download data

In this exercise, you'll use a dataset of ice cream sales to train a model that predicts the demand for ice creams on a given day, based on seasonal and meteorological features.

1. In a new browser tab, download **[ml-data.zip](https://aka.ms/mslearn-ml-data)** from `https://aka.ms/mslearn-ml-data` to your local computer.
1. Extract the downloaded **ml-data.zip** archive to see the files it contains. Note that one of these files is **ice-cream.csv**, which contains the ice cream sales data required for this exercise.

## Use automated machine learning to train a model

Automated machine learning enables you to try multiple algorithms and parameters to train multiple models, and identify the best one for your data.

1. In the portal, view the **Automated ML** page (under **Authoring**).

1. Create a new Automated ML job with the following settings, using **Next** as required to progress through the user interface:

    > **Tip**: If no explicit information for a setting is provided in the steps below, use the default value.

    **Basic settings**:

    - Assign a unique **job name** for your automated machine learning job

   **Task type & data**:

    - Set the task type to **Regression**.
    - Create a new ***tabular*** data asset named **ice-cream**
        - Upload the local **ice-cream.csv** file to the default workspace storage.
        - Include <u>only</u> the following columns (*Date* is unique for each row, and adds little predictive capability on its own):
            - **DayOfWeek**
            - **Month**
            - **Temperature**
            - **Rainfall**
            - **IceCreamsSold**
        - Create the data asset.
    - Ensure your newly created **ice-cream** data asset is selected before moving to the next step

    > **Note**: If you are using an Azure subscription for which you are not an administrator, key-based access to storage may have been disallowed by policy. In this case, you'll need to work with your administrator to allow key-based access or reconfigure your Azure Machine Learning workspace to use Entra ID authentication to access storage. If you can't do this, use the browser-based ***ML Lab*** app for this exercise.

    **Task settings**:

    - Set the **target column** (the label we want the model to predict) to **IceCreamsSold**.
    - Set **Additional configuration settings**:
        - Set the **Primary metric** to the metric you want to use to evaluate model performance. In this exercise, use the *R<sup>2</sup>* score.
        - Select the model algorithms you want to try (or leave them all selected)
    - Set **Featurization settings**:
        - Use these settings to customize featurization (how the data features are prepared for model training)
    - Set **Limits**:
        - Use the limits to end the training job early based on specific criteria. In this exercise, set the following limits:
            - **Metric score threshold**: 0.9
            - **Experiment timeout (minutes)**: 15
        
        > **Note** It's important to set these limits when using Azure Machine Learning, as running training jobs for every possible algorithm and featurization combination could potentially take hours!

    **Compute**:

    - Use **Serverless** compute

    **Review**

    - Review the settings and check them carefully. Then submit the training job. It starts automatically.

1. Wait for the job to finish.

    > **Tip**: If you're using Azure Machine Learning, it might take a while — now might be a good time for a coffee break!

## Review the best model

When the automated machine learning job has completed, you can review the best model it trained.

1. On the **Overview** tab of the job details page, view the information about the job and note the best model summary.
  
1. Select the **Algorithm name** for the best model to view its details. Then on the child job details page, view the following tabs:
    - **Overview**: General details for the child job.
    - **Model**: Information about the model that was trained.
    - **Metrics** Evaluation metrics and visualizations for the model based on the test data used during the training process.
    - **Outputs and logs**: Information logged during the training process.

## Deploy and test the model

1. On the **Model** tab for the best model trained by your automated machine learning job, select **Deploy** to deploy the model to a Real-time endpoint.

    Select appropriate **Instances** and **Virtual machine** options for the compute on which the deployed endpoint will run (which may depend on the quota available in your Azure subscription), and assign suitable **endpoint** and **deployment** names.

1. Wait for a notification that the deployment is complete.

    > **Tip**: In Azure Machine Learning studio, endpoint deployment may take 5-10 minutes.

## Test the deployed service

Now you can test your deployed service.

1. In the navigation menu, select the **Endpoints** page and open the real-time endpoint you created.

1. On the endpoint page view the **Test** tab.

1. In the **Input data to test endpoint** pane, replace the template JSON with the following input data:

    ```json
   {
     "input_data": {
        "columns": [
            "DayOfWeek",
            "Month",
            "Temperature",
            "Rainfall"
        ],
        "index": [0],
        "data": [["Wednesday","June",70.5,0.05]]
     }
   }
    ```

1. Click the **Test** button.

1. Review the test results, which include a predicted number of rentals based on the input features - similar to this:

    ```JSON
   [
       120.16208168753236
   ]
    ```

    The test pane took the input data and used the model you trained to return the predicted number of rentals.

## View code to consume the model

Now that you have a predictive model, developers can build applications that consume it.

1. On the real-time endpoint page view the **Consume** tab.
1. Review the sample code to consume your model.

## If time permits

If you want to experiment further with automated machine learning, try training a **classification** model based on the **penguins.csv** file that was included in the **ml-data.zip** archive you downloaded previously. Use all of the columns in this dataset.

After training and deploying a classification model, you can test it in the endpoint with the following JSON:

```json
{
    "input_data": {
    "columns": [
        "CulmenLength",
        "CulmenDepth",
        "FlipperLength",
        "BodyMass"
    ],
    "index": [0],
    "data": [[45.2,13.8,215,4750]]
    }
}
```

## Clean-up

If you used Azure Machine Learning to complete this exercise you should delete the resources you created to avoid accruing unnecessary Azure usage.

1. In [Azure Machine Learning studio](https://ml.azure.com), on the **Endpoints** tab, select the endpoint you deployed. Then select **Delete** and confirm that you want to delete the endpoint.

    Deleting your compute ensures your subscription won't be charged for compute resources. You will however be charged a small amount for data storage as long as the Azure Machine Learning workspace exists in your subscription. If you have finished exploring Azure Machine Learning, you can delete the Azure Machine Learning workspace and associated resources.

To delete your workspace:

1. In the [Azure portal](https://portal.azure.com), in the **Resource groups** page, open the resource group you specified when creating your Azure Machine Learning workspace.
2. Click **Delete resource group**, type the resource group name to confirm you want to delete it, and select **Delete**.
