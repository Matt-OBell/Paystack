<?php
namespace Mattobell\Paystack\Model\Ui;

use Magento\Checkout\Model\ConfigProviderInterface;
use Magento\Payment\Helper\Data;
use Magento\Store\Model\Store;

/**
 * Class ConfigProvider
 */
final class ConfigProvider implements ConfigProviderInterface
{
    const CODE = 'paystack';

        protected $method;

    public function __construct(Data $paymentHelper,Store $store)
    {
        $this->method = $paymentHelper->getMethodInstance(self::CODE);
        $this->store = $store;
    }


    /**
     * Retrieve assoc array of checkout configuration
     *
     * @return array
     */
    public function getConfig()
    {
        $key = $this->method->getConfigData('apikey');

        return [
            'payment' => [
                self::CODE => [
                    'paystack_key' => $key,
                    'description' => $this->method->getConfigData('description')
                ]
            ]
        ];
    }
}
