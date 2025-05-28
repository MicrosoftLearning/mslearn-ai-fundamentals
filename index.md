---
title: Microsoft Learn - Introduction to AI in Azure Exercises
permalink: index.html
layout: home
---

# AI-900: Introduction to AI in Azure Exercises

These hands-on exercises are designed to support training content on [Microsoft Learn](https://docs.microsoft.com/training/).

To complete these exercises, you'll need a Microsoft Azure subscription. You can sign up for a free trial at [https://azure.microsoft.com](https://azure.microsoft.com).

{% assign labs = site.pages | where_exp:"page", "page.url contains '/Instructions/Exercises'" %}
| Exercises |
| ------- | 
{% for activity in labs  %}| [{{ activity.lab.title }}]({{ site.github.url }}{{ activity.url }}) |
{% endfor %}
