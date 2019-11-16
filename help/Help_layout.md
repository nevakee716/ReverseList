| **Name** | **cwLayoutReverseList** | **Version** | 1.0 |
| --- | --- | --- | --- |
| **Updated by** | Jerome GRONDIN |

## Description 
Allow you to reverse a hierarchical tree in order to re-order data. You can use all layouts you want at the top of reverse tree (just select the layout you want to use at the level which will be displayed first) This layout is read-only. Due to technical reason it is not possible to allow the creation of association when using this layout.  **Caution:** do not configure multiple association branches in Evolve Designer when using this layout. |
## Screen Shot
Assuming you have a hierarchical tree, this layout allows you to reverse it to display data in another order. For exemple, if you have the following configuration:

![](https://github.com/nevakee716/ReverseList/raw/master/screen/image1.png)

It will allow you to display that way :

![](https://github.com/nevakee716/ReverseList/raw/master/screen/image1b.png)

## Notes  
Due to the architecture of the core product, this layout may not work in some context such as (non limitative list) :  
* popout
* table

## Installation
https://github.com/casewise/cpm/wiki

### Node setup
![](https://github.com/nevakee716/ReverseList/raw/master/screen/image2.png)
### Parameter setup 
![](https://github.com/nevakee716/ReverseList/raw/master/screen/image3.png) 
Set up the layout you want to use to display the list of Activities in the **Use Layout**. You need to set the name of the JavaScript class.Ex: to display activities in a list, set **cwLayoutList**  Set up the node Id of the last node in the **Last Node** optionEx: here the **Last Node** value is the node ID of the Macro Process node. It will indicate that the reverse option should stop here. You can modify the layout used at the Macro Process level. For example you can try to set the Layout List Box. You can also use behaviours on all nodes of the tree.  |