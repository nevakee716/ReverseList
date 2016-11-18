/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function(cwApi, $) {
    'use strict';
    var cwLayoutReverseList;

    cwLayoutReverseList = function(options, viewSchema) {
        var i, hasChildrenNodes,  currentChild, children, firstAssociationChild;
        hasChildrenNodes = false;
        children = [];
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
        this.drawOneMethod = cwApi.cwLayouts.cwLayoutList.drawOne.bind(this);
        cwApi.registerLayoutForJSActions(this);

        this.backupSchema = this.cloneSchema(viewSchema);
        // update schema here (only if this node has children, otherwise it already has been updated ?)
        this.stopNodeId = this.options.CustomOptions['last-reverse-node'];
        if (this.mmNode.SortedChildren.length > 0){
            for (i = 0; i < this.mmNode.SortedChildren.length; i+=1) {
                currentChild = this.mmNode.SortedChildren[i];
                if (currentChild.Type === 1){
                    // association node
                    hasChildrenNodes = true;
                    if (cwApi.isUndefined(firstAssociationChild)){
                        firstAssociationChild = currentChild;
                    }
                } else if (currentChild.Type === 0){
                    // property group
                    children.push(currentChild);
                }
            }
            if (hasChildrenNodes){
                if(cwApi.isUndefined(this.stopNodeId)){
                    cwApi.Log.Error('<last-reverse-node> option is not set');
                    return;
                }
                this.oldSchema = {};
                this.reverseSchema(viewSchema, firstAssociationChild.NodeId, this.mmNode.NodeID);
            }
            // update mmNode
            this.mmNode.SortedChildren = children;
        }
    };

    cwLayoutReverseList.prototype.cloneSchema = function(o){
        return $.extend(true,{},o);
    };

    cwLayoutReverseList.prototype.setOriginalSchema = function(){
        cwApi.cwConfigs.ViewsSchemas[this.viewSchema.ViewName] = this.backupSchema;
    };

    cwLayoutReverseList.prototype.drawAssociations = function(output, associationTitleText, object){
        /*jslint unparam:true*/
        var layout, nodeSchema;
        // update data here
        if(cwApi.isUndefined(this.stopNodeId)){
            cwApi.Log.Error('<last-reverse-node> option is not set');
            return;
        }
        
        if (!cwApi.isUndefined(this.oldSchema)){
            // reverse data
            this.allObjectIdsByNodeId = {};
            this.reverseData(object, this.mmNode.NodeID);
            // display data
            nodeSchema = this.viewSchema.NodesByID[this.stopNodeId];
            layout = new cwApi.cwLayouts[nodeSchema.LayoutName](nodeSchema.LayoutOptions, this.viewSchema);
            if (!cwApi.isUndefined(cwApi.cwLayouts[nodeSchema.LayoutDrawOne].drawOne)) {
              layout.drawOneMethod = cwApi.cwLayouts[nodeSchema.LayoutDrawOne].drawOne.bind(layout);
            }
            output.push('<div class="reverse-node reverse-node-', this.nodeID, '">');
            layout.drawAssociations(output, null, object, null);
            output.push('</div>');
            // set original schema (necessary when displaying data again if schema is not reloaded)
            this.setOriginalSchema();
        }
    };

    cwLayoutReverseList.prototype.reverseSchema = function(viewSchema, childId, fatherId) {
        // recursive
        // father becomes child
        var childNode, nextChildId, i, hasChildrenNodes = false;
        childNode = viewSchema.NodesByID[childId];
        
        this.oldSchema[fatherId] = {SortedChildren:[{LayoutJSClass:"", LayoutOptions:null, NodeId:childId, Type:1}]};

        for(i=0; i < childNode.SortedChildren.length; i+=1){
            if (childNode.SortedChildren[i].Type === 1){
                nextChildId = childNode.SortedChildren[i].NodeId;
                childNode.SortedChildren[i] = {LayoutJSClass:"", LayoutOptions:null, NodeId:fatherId, Type:1};
                hasChildrenNodes = true;
                break;
            }
        }
        if (!hasChildrenNodes){
            childNode.SortedChildren.push({LayoutJSClass:"", LayoutOptions:null, NodeId:fatherId, Type:1});
            // set replace layout
            this.viewSchema.NodesByID[this.nodeID].LayoutName = this.options.CustomOptions['replace-layout'];
            this.viewSchema.NodesByID[this.nodeID].LayoutDrawOne = this.options.CustomOptions['replace-layout'];
        }
        if (this.stopNodeId !== childId){
            this.reverseSchema(viewSchema, nextChildId, childId);
        }
    };

    cwLayoutReverseList.prototype.reverseData = function(object, currentNodeId){
        var i;
        if (this.oldSchema.hasOwnProperty(currentNodeId)){
            for (i = 0; i < object.associations[currentNodeId].length; i+=1) {
                this.invertTree(object, object.associations[currentNodeId][i], currentNodeId);
            }
            delete object.associations[currentNodeId];
            for( i = 0; i < this.oldSchema[currentNodeId].SortedChildren.length; i+=1){
                this.reverseData(object, this.oldSchema[currentNodeId].SortedChildren[i].NodeId);
            }
        }
    };

    function findItemInArrayById(o){
        return o.object_id === this.object_id;
    }

    cwLayoutReverseList.prototype.invertTree = function(data, o, currentNodeId){
        var i, j, childNodeId, target;
        for (i = 0; i < this.oldSchema[currentNodeId].SortedChildren.length; i+=1) {
            childNodeId = this.oldSchema[currentNodeId].SortedChildren[i].NodeId;
            if (!data.associations.hasOwnProperty(childNodeId)){
                data.associations[childNodeId] = [];
            }

            for (j = 0; j < o.associations[childNodeId].length; j+=1) {
                target = o.associations[childNodeId][j];
                // check if items already exists and add it to root
                if (!this.allObjectIdsByNodeId.hasOwnProperty(childNodeId)){
                    // add item
                    this.allObjectIdsByNodeId[childNodeId] = [];
                    this.allObjectIdsByNodeId[childNodeId].push(target.object_id);
                    data.associations[childNodeId].push(target);
                } else if (this.allObjectIdsByNodeId[childNodeId].indexOf(target.object_id) === -1){
                    this.allObjectIdsByNodeId[childNodeId].push(target.object_id);
                    data.associations[childNodeId].push(target);
                } else {
                    // already exists
                    target = data.associations[childNodeId].filter(findItemInArrayById, target)[0];
                }

                // add o to child
                if(!target.associations.hasOwnProperty(currentNodeId)){
                    target.associations[currentNodeId] = [];
                }
                target.associations[currentNodeId].push(o);
            }
            delete o.associations[childNodeId];
        }
    };

    cwApi.cwLayouts.cwLayoutReverseList = cwLayoutReverseList;

}(cwAPI, jQuery));