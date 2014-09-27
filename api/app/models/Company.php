<?php

class Company extends \Eloquent {
	protected $fillable = array(
        'company_code','company_name','company_short_name',
        'company_address','municipality_code','settlement_code',
        'street_code','telephone1','telephone2','fax','mail','owner',
        'authorized','activity','id_number','tax_code','tax_payer','user'
    );
    public function scopeApp($query){
        $user=Auth::getUser();
        $tableName=(new self)->getTable();
        return $query->join('users',function($join) use ($user,$tableName){
            $join->on($tableName.".user",'=','users.id');
            $join->where('users.application', '=', $user->application);
        });
    }
    public function municipalities(){
        return $this->belongsTo('Municipality','municipality_code','municipality_code');
    }
    public function settlements(){
        return $this->belongsTo('Settlement','settlement_code','settlement_code');
    }
    public function streets(){
        return $this->belongsTo('Street','street_code','street_code');
    }
    public function banks(){
        return $this->belongsToMany('Bank')->withPivot('bank_account','rang');
    }
}