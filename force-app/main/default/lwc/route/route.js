import { LightningElement, api, track } from 'lwc';
import {dispatchEvent, matchPath, registerListener,getRouteMatch, REGISTER_SWITCH_EVENT_NAME, REGISTER_GET_PARAM_EVENT_NAME, REGISTER_GET_ROUTE_MATCH_EVENT_NAME} from 'c/lwcRouter';
export default class Route extends LightningElement {
    @api path;
    @api exact = false;
    @track currentPath;
    @track switchInstance;
    @track isPathMatching;
    @track matcher;
    unsubscribe;
    parentPath;
    
    async connectedCallback(){
        await getRouteMatch(this, ({path, url}) => {
            this.parentPath = path;
            if(this.path.indexOf(':path') > -1){
                this.path = this.path.replace(':path', this.parentPath);
            }
        })
        registerListener(REGISTER_GET_PARAM_EVENT_NAME, this, this.getParam.bind(this));
        registerListener(REGISTER_GET_ROUTE_MATCH_EVENT_NAME, this, this.getRouteMatch.bind(this));
        await dispatchEvent(REGISTER_SWITCH_EVENT_NAME, this, (switchInstance) => {
            this.switchInstance = switchInstance;
            this.unsubscribe = this.switchInstance.subscribe(this,this.handleChange.bind(this))
        })
        
    }
    getParam(event){
        let callback = event.detail;
        if(this.matcher){
            callback(this.matcher.urlParam);
        }else{
            callback({});
        }
        event.stopPropagation();
    }
    getRouteMatch(event){
        let callback = event.detail;
        callback({path : this.path, url : this.matcher.url});
        event.stopPropagation();
    }
    disconnectedCallback(){
        if(this.unsubscribe){
            this.unsubscribe.unsubscribe();
        }
    }
    handleChange(ignoreNotFound){
        this.currentPath = this.switchInstance.currentPath;
        this.matcher = matchPath(this.path, this.currentPath, this.exact, ignoreNotFound);
        this.isPathMatching = this.matcher.isMatching;
        return this.isPathMatching;
    }
    get renderChild(){
        return this.isPathMatching;
    }
    renderedCallback(){
        console.log(JSON.stringify(this.matcher))
    }
}