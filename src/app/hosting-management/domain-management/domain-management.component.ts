import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service/src/services';
interface Domain {
  id: number;
  name: string;
  status: string;
}
@Component({
  selector: 'app-domain-management',
  templateUrl: './domain-management.component.html',
  styleUrls: ['./domain-management.component.scss']
})
export class DomainManagementComponent implements OnInit {

  loading:boolean = true;
  domains: Domain[] = [
    { id: 1, name: 'example.com', status: 'Active' },
    { id: 2, name: 'testsite.net', status: 'Inactive' }
  ];
  domainForm: FormGroup;
  editingDomain: Domain | null = null;
  currentHosting: any;

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private functionService: FunctionService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) { 
    this.domainForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.parent.params.subscribe((routeParam) => {
      this.vhQueryAutoWeb.getHosting_byEndUser(routeParam.id_hosting)
      .then((res) => {
        if(res.vcode != 0) return this.functionService.createMessage('error', res.msg);
        this.currentHosting = res.data
      })
      .finally(() => this.loading = false);
    });


  }


  addDomain() {
    if (this.domainForm.valid) {
      const newDomain: Domain = {
        id: this.domains.length + 1,
        name: this.domainForm.value.name,
        status: this.domainForm.value.status
      };
      this.domains.push(newDomain);
      this.domainForm.reset();
    }
  }

  editDomain(domain: Domain) {
    this.editingDomain = domain;
    this.domainForm.setValue({ name: domain.name, status: domain.status });
  }

  updateDomain() {
    if (this.domainForm.valid && this.editingDomain) {
      this.editingDomain.name = this.domainForm.value.name;
      this.editingDomain.status = this.domainForm.value.status;
      this.editingDomain = null;
      this.domainForm.reset();
    }
  }

  deleteDomain(id: number) {
    this.domains = this.domains.filter(domain => domain.id !== id);
  }
}
