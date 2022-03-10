# Setup plugin
Current version of JDN plugin is client-server application with two independent parts and both parts should be installed separately.

### **Setup plugin to Chrome**
* Download the version 3.1.106 of the plugin: https://github.com/jdi-testing/jdn-ai/releases/download/3.1.106/3.1.106.zip
  * For developers only: Download the last version of the plugin: https://github.com/jdi-testing/jdn-ai/releases (you need an archive named like the JDN version) as archive (.zip file)
* Unpack the content to any convenient place (the result folder name is 'dist')
* Open Chrome Settings -> choose option 'More tools' -> choose option Extensions ->Turn on the Developer mode -> Click 'Load unpacked'
* Select unpacked folder with the plugin on subfolders level (in the way that the contend as 'CSS' and 'Images', don’t do it just for 'dist' folder)
* Open Chrome developer tools via F12 hotkey -> JDN tab should be added as the last tab at the Devtools

### **Setup server part**
* Setup Docker https://www.docker.com/products/docker-desktop
* Download the latest Docker Compose file from the `develop` branch and run `docker compose`:
#### Stable version
**macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/master/docker-compose-stable.yaml && docker compose up
```
**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/master/docker-compose-stable.yaml && docker compose up
```

#### Development version
**macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```
**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```
* In _Windows 10_ can be used both, PowerShell and regular command-line, for _macOS_ native terminal can be used.
* <span style="color:orange">Attention! The first time, when you build the docker image, it can take significant time<span>
* After finishing of downloading check that container is created. The number of back-end version should be displayed in JDN plugin tab near the front-end version.
* The plugin doesn't work properly in "Dock to bottom" view. Please use another dock side view. 


# **How to work with the plugin**

The plugin allows generating Page Objects:
- for the JDI framework;
- locators type - xPath;
- only for Material UI and HTML5 sites.


### Page object generation
Attention! Before start the locators recognizing, you need to check that the back-end is running.
The current version of back-end should be displayed in JDN plugin tab near the front-end version, it is the simplest way to check that back-end is installed properly and connected.
 
* open the plugin (Open Chrome Developer Tools with F12 -> open the last tab on JDN Devtools);
* open the target page, which you want to generate a page object for, click 'New page object' button, click "Generate" button;
* the process of recognizing locators on the page and their generation will begin.



### Tabs in the Locators list:

* **Generated** - this tab displays all the locators that have already been generated by plugin;

* **Waiting for generating** - this tab displays locators that are currently being generated or waiting in the generation queue. Locators are displayed with full xpaths on this tab, they will be changed to the new xpaths at the end of the generation process.
 
* **Deleted** - optional - this tab displays all the locators that have been deleted from other groups;


### Ways to interact with locators:

* **on the cover of the locator on the web page:**
  * Left Button Mouse Click - selects an object; 
  * Right Button Mouse Click - opens the context menu;

* **in the locators list in the plugin:**
  * actions with a specific locator - click on the menu button next to the desired locator OR hover locator and click Copy icon;
  * actions with a group of locators - select the required locators using checkboxes and use the control buttons that appeared at the top of the table.


### Actions that can be performed with locators:

* **Edit** -  you can change the block type, variable name or xpath of the locator;
* **Delete** - for any locators;
* **Stop generation** - for locators that are in section “Waiting for generation“;
* **Rerun** - if locator in section “Waiting for generation“ has been stopped;
* **Restore** - for section “Deleted locators“;
* **Bring to front/background** - for locator editing through the context menu.


### Prediction Accuracy
The Prediction Accuracy is displayed at the top next to each locator on the page.

The indicator of Prediction Accuracy shows the confidence of the plugin that it correctly recognized the element (e.g. link, button, table, etc.). For example, if you see that the button was recognized with a Prediction Accuracy of 50%, then it may be worth checking this element. If the Prediction Accuracy is 90%, this recognition should be trusted more.

You can filter all locators by Prediction Accuracy using the slider in the plugin. Only objects that are **above** this slider are displayed in the locator list and highlighted on a web page. 


### Downloading single Page Object

To place some locators in your Page object result file, you need to highlight them with checkboxes (or in blue area on the target page) and then click 'Confirm' button under the Locators list table. Locators will be added to Page Object. To download it click Page Object meatball menu and click Download button. Page Object in Java format will be downloaded to your computer. 
 
### Downloading all Page Objects

To place some locators in your Page object result file, you need to highlight them with checkboxes (or in blue area on the target page) and then click 'Confirm' button under the Locators list table. Locators will be added to Page Object. To download all Page Objects click Download button. All Page Objects in zip folder will be downloaded to your computer. 
 
 ### Deleting single Page Object

To place some locators in your Page object result file, you need to highlight them with checkboxes (or in blue area on the target page) and then click 'Confirm' button under the Locators list table. Locators will be added to Page Object. To delete it click Page Object meatball menu and click Delete button. Page Object will be deleted from the Page Objects list.
 
### Deleting all Page Objects

To place some locators in your Page object result file, you need to highlight them with checkboxes (or in blue area on the target page) and then click 'Confirm' button under the Locators list table. Locators will be added to Page Object. To delete all Page Objects click Delete button. All Page Objects will be deleted from the Page Objects list.



# **Branching**

```master``` - base branch
```issue_<YOUR_ISSUE_NUMBER>``` - feature or bugfix branch, started from master and merged into master when feature is ready
```release_<RELEASE_NUMBER>``` - release branch, start from master
```hotfix_<ISSUE_NUMBER>```  - fix for release, start from release branch and merged into it



# **How to update version**

For updating version in package.json and manifest.json you can run 
```
  npm run patch
```
or manualy change version in this files.

Commit and push changes.

When your request has been merged, github actions will create draft of release with current package.json version tag.
 
 # **How to update backend version**
 
 Abort the currently running process is terminal (Ctrl + C)
 
 ```
docker-compose stop
docker-compose rm -f
docker-compose pull   
docker-compose up -d
```
 Run curl again

# **CI/CD**

Delivery pack is builded autimatically on commit in master.
