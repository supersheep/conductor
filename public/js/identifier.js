/**
 * 元素识别器
 */
define(function(require,exports,module){

    function Identifier(doc){
        this.doc = doc;
        if(!Identifier.instance){
            Identifier.instance = this;
        }
    }


    /**
     * 
     * @return 是否可以通过简单的选择器唯一的识别
     */
    Identifier.prototype.onlyOne = function(selector){
        return $(selector,this.doc).length == 1;
    }


    Identifier.prototype.identifyMulti = function(elem){
        var parent = elem;
        var self = this;
        var body = this.doc.body;
        var results = [];
        var selectors = null;
        function exists(elems_to_match){
            return results.some(function(result){
                var elems = result.elems;
                var l = Math.max(elems.length,elems_to_match.length);
                for(var i = 0;i<l;i++){
                    if(elems[i] != elems_to_match[i]){
                        return false;
                    }
                };
                return true;
            });
        }

        function possible_selectors(elem){
            var selectors;
            if(elem.attr("class")){
                selectors = elem.attr("class").split(/\s/).map(function(cls){
                    return "."+cls;
                });
            }else{
                selectors = [elem.get(0).tagName.toLowerCase()];
            }
            return selectors;
        }

        function mix_selectors(arr1,arr2){
            var results = [];
            arr1.forEach(function(s1){
                arr2.forEach(function(s2){
                    results.push([s1,s2].join(" "))
                });
            });
            return results;
        }

        while(parent.get(0)!=body){
            parent = elem.parent();
            
            selectors = selectors || possible_selectors(elem);

            selectors.forEach(function(selector){
                var elems = parent.find(selector)
                if(elems.length > 1 && !exists(elems)){
                    results.push({
                        selector:selector,
                        parent:self.identifySingle(parent),
                        elems:elems
                    });
                }
            });

            selectors = mix_selectors(possible_selectors(parent),selectors);
            elem = parent;
        }
        return results;
    }

    Identifier.prototype.traverseParent = function(elem,selector){
        var body = this.doc.body;
        var parent;
        if(elem.parent().get(0) == body){
            return selector;
        }else{
            return [this.identifySingle(elem.parent()),selector].join(" ");
        }
    }

    Identifier.prototype.identifySingle = function(elem){
        var selector;
        if(elem.attr("id")){
            selector = "#"+elem.attr("id");
        }else if(elem.attr("class")){
            selector = elem.attr("class").split(/\s/).map(function(cls){return "."+cls}).join("");
            if(!this.onlyOne(selector)){
                selector = this.traverseParent(elem,selector);
            }
        }else{
            selector = elem.get(0).tagName.toLowerCase();
            if(!this.onlyOne(selector)){
                selector = this.traverseParent(elem,selector);
            }
        }

        if(!this.onlyOne(selector)){
            selector = selector + ":nth-child(" + ($(selector,this.doc).parent().children().index(elem)+1) + ")";
        }
        return selector;
    }

    Identifier.prototype.identify = function(elem,opt){
        elem = $(elem,this.doc);
        if(opt.mode=="single"){
            return this.identifySingle(elem);
        }else if(opt.mode == "multi"){
            return this.identifyMulti(elem);
        }        
    }


    module.exports = Identifier;
});