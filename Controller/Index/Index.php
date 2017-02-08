<?php

namespace Mattobell\Paystack\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\Controller\ResultFactory;
use Magento\Backend\Model\View\Result\RedirectFactory;

class Index extends Action
{
    const LENGTH = 16;


    public function execute()
    {
        //Generates cryptographically secure pseudo-random bytes
        $bytes = bin2hex(random_bytes(self::LENGTH));
        $bytes = date('ymd'). '-'. $bytes;
        $page = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        //Pass random bytes
        $page->setData(['nonce' => $bytes]);
        return $page;

    }
}
